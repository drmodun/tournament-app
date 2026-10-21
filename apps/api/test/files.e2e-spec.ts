import { INestApplication } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import request from 'supertest';
import { createApp, loginAs } from './helpers/tournamentRun';

// Stands in for the S3 server, so uploads need no storage service and leave nothing behind
class FakeS3 {
  objects = new Map<string, { body: Buffer; contentType?: string }>();

  async send(command: unknown) {
    if (command instanceof PutObjectCommand) {
      const { Key, Body, ContentType } = command.input;

      this.objects.set(Key!, {
        body: Buffer.from(Body as Buffer),
        contentType: ContentType,
      });
      return {};
    }

    if (command instanceof GetObjectCommand) {
      const stored = this.objects.get(command.input.Key!);

      if (!stored) {
        throw Object.assign(new Error('The specified key does not exist.'), {
          name: 'NoSuchKey',
          $metadata: { httpStatusCode: 404 },
        });
      }

      return {
        Body: Readable.from(stored.body),
        ContentType: stored.contentType,
        ContentLength: stored.body.length,
      };
    }

    if (command instanceof DeleteObjectCommand) {
      this.objects.delete(command.input.Key!);
      return {};
    }

    throw new Error('Unexpected S3 command');
  }
}

const png = () =>
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    Buffer.from('not really a picture'),
  ]);
const jpeg = () =>
  Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('JFIF')]);
const gif = () => Buffer.from('GIF89a......');
const webp = () =>
  Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([1, 2, 3, 4]),
    Buffer.from('WEBPVP8 '),
  ]);

describe('Image uploads (e2e)', () => {
  let app: INestApplication;
  let s3: FakeS3;
  let token: string;

  beforeAll(async () => {
    s3 = new FakeS3();
    app = await createApp((builder) =>
      builder.overrideProvider('AWS_S3').useValue(s3),
    );
    token = await loginAs(app, 21);
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  const upload = (
    directory: string,
    file: Buffer,
    options: {
      filename?: string;
      contentType?: string;
      field?: string;
      token?: string | null;
    } = {},
  ) => {
    const req = http().post(`/files/${directory}`);
    const bearer = options.token === undefined ? token : options.token;

    if (bearer) req.set('Authorization', `Bearer ${bearer}`);

    return req.attach(options.field ?? 'file', file, {
      filename: options.filename ?? 'picture.png',
      contentType: options.contentType ?? 'image/png',
    });
  };

  describe('uploading', () => {
    it('needs a signed-in user', async () => {
      await upload('avatar', png(), { token: null }).expect(401);
      expect(s3.objects.size).toBe(0);
    });

    it.each([
      ['PNG', png, 'image/png', 'png'],
      ['JPEG', jpeg, 'image/jpeg', 'jpeg'],
      ['GIF', gif, 'image/gif', 'gif'],
      ['WebP', webp, 'image/webp', 'webp'],
    ])(
      'stores a %s and returns its key and address',
      async (_name, make, type, extension) => {
        const response = await upload('avatar', make()).expect(201);

        expect(response.body.key).toMatch(
          new RegExp(`^avatar/[0-9a-f-]{36}\\.${extension}$`),
        );
        expect(response.body.url).toMatch(
          new RegExp(`/files/${response.body.key}$`),
        );
        expect(s3.objects.get(response.body.key)).toMatchObject({
          contentType: type,
        });
      },
    );

    it.each([
      'avatar',
      'group-avatar',
      'group-banner',
      'tournament',
      'tournament-avatar',
      'quiz',
    ])('accepts the %s directory', async (directory) => {
      const response = await upload(directory, png()).expect(201);

      expect(response.body.key.startsWith(`${directory}/`)).toBe(true);
    });

    it('refuses directories that are not for uploads', async () => {
      await upload('test', png()).expect(400);
      await upload('nowhere', png()).expect(400);
      await upload('..', png()).expect(400);
    });

    it('decides the type from the bytes, not from the name or the declared type', async () => {
      // A real PNG called .exe and declared as text is still a PNG
      const disguised = await upload('avatar', png(), {
        filename: 'run-me.exe',
        contentType: 'text/plain',
      }).expect(201);

      expect(s3.objects.get(disguised.body.key)!.contentType).toBe('image/png');

      // A script called .png is not an image
      await upload('avatar', Buffer.from('<script>alert(1)</script>'), {
        filename: 'picture.png',
        contentType: 'image/png',
      }).expect(400);
      await upload(
        'avatar',
        Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
        {
          filename: 'logo.svg',
          contentType: 'image/svg+xml',
        },
      ).expect(400);
    });

    it('refuses an empty file and a request with no file', async () => {
      await upload('avatar', Buffer.alloc(0)).expect(400);
      await upload('avatar', png(), { field: 'image' }).expect(400);
      await http()
        .post('/files/avatar')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('refuses a file over 5 MB', async () => {
      const big = Buffer.concat([png(), Buffer.alloc(5 * 1024 * 1024)]);
      const before = s3.objects.size;

      const response = await upload('avatar', big);

      expect([400, 413]).toContain(response.status);
      expect(s3.objects.size).toBe(before);
    });

    it('accepts a file just under 5 MB', async () => {
      const almost = Buffer.concat([
        png(),
        Buffer.alloc(5 * 1024 * 1024 - 1024),
      ]);

      await upload('avatar', almost).expect(201);
    });

    it('gives every upload its own key', async () => {
      const first = await upload('avatar', png()).expect(201);
      const second = await upload('avatar', png()).expect(201);

      expect(first.body.key).not.toBe(second.body.key);
    });
  });

  describe('the address in the answer', () => {
    const original = process.env.API_PUBLIC_URL;

    afterEach(() => {
      if (original === undefined) delete process.env.API_PUBLIC_URL;
      else process.env.API_PUBLIC_URL = original;
    });

    it('uses API_PUBLIC_URL when it is set, without a trailing slash', async () => {
      process.env.API_PUBLIC_URL = 'https://example.com/api///';

      const response = await upload('avatar', png()).expect(201);

      expect(response.body.url).toBe(
        `https://example.com/api/files/${response.body.key}`,
      );
    });

    it('falls back to the address of the request', async () => {
      delete process.env.API_PUBLIC_URL;

      const response = await upload('avatar', png()).expect(201);

      expect(response.body.url).toMatch(
        /^http:\/\/127\.0\.0\.1:\d+\/files\/avatar\//,
      );
    });
  });

  describe('serving', () => {
    it('serves an upload to anyone with the right headers', async () => {
      const uploaded = await upload('group-avatar', png()).expect(201);

      const served = await http()
        .get(`/files/${uploaded.body.key}`)
        .expect(200);

      expect(served.headers['content-type']).toBe('image/png');
      expect(served.headers['cache-control']).toBe(
        'public, max-age=31536000, immutable',
      );
      expect(served.headers['x-content-type-options']).toBe('nosniff');
      expect(served.headers['content-security-policy']).toBe(
        "default-src 'none'",
      );
      expect(Buffer.from(served.body).equals(png())).toBe(true);
    });

    it('answers 404 for a name that does not exist', async () => {
      await http()
        .get('/files/avatar/00000000-0000-0000-0000-000000000000.png')
        .expect(404);
    });

    it('refuses names and directories that are not uploads', async () => {
      await http().get('/files/avatar/..%2F..%2Fsecret.png').expect(400);
      await http().get('/files/avatar/not-a-generated-name.png').expect(400);
      await http()
        .get('/files/test/00000000-0000-0000-0000-000000000000.png')
        .expect(400);
      await http()
        .get('/files/avatar/00000000-0000-0000-0000-000000000000.PNG')
        .expect(400);
    });

    it('does not serve an object from a different directory under another name', async () => {
      const uploaded = await upload('avatar', png()).expect(201);
      const name = (uploaded.body.key as string).split('/')[1];

      await http().get(`/files/quiz/${name}`).expect(404);
    });
  });
});
