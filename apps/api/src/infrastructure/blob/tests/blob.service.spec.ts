import { Test, TestingModule } from '@nestjs/testing';
import { BlobService } from '../blob.service';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { InternalServerErrorException } from '@nestjs/common';
import { DirectoriesEnum } from '../types';
import { File } from 'buffer';
import { AwsS3Provider } from '../blob.provider';

describe('BlobService', () => {
  let service: BlobService;
  let s3Client: S3Client;

  it('should throw an error if AWS credentials are not set', () => {
    process.env.AWS_REGION = '';
    process.env.AWS_ACCESS_KEY_ID = '';
    process.env.AWS_SECRET_ACCESS_KEY = '';

    expect(() => AwsS3Provider.useFactory()).toThrow(Error);
  });

  beforeEach(async () => {
    process.env.AWS_REGION = 'test-region';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.AWS_S3_BUCKET = 'test-bucket';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsS3Provider, BlobService],
    }).compile();

    service = module.get<BlobService>(BlobService);
    s3Client = module.get<S3Client>('AWS_S3');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateKey', () => {
    it('should generate a key with the correct format', () => {
      const directory = DirectoriesEnum.TEST;
      const mimeType = 'image/png';
      const key = service.generateKey(directory, mimeType);
      expect(key).toMatch(new RegExp(`^${directory}/[a-f0-9-]+\\.png$`));
    });

    it('should default to txt extension if mime type is not provided', () => {
      const directory = DirectoriesEnum.TEST;
      const key = service.generateKey(directory);
      expect(key).toMatch(new RegExp(`^${directory}/[a-f0-9-]+\\.txt$`));
    });
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const body = new File(['content'], 'test.txt', { type: 'text/plain' });
      const directory = DirectoriesEnum.TEST;
      const result = { ETag: 'etag' };

      jest
        .spyOn(s3Client, 'send')
        .mockImplementationOnce(() => Promise.resolve(result));

      const response = await service.uploadFile(body, directory);
      expect(response).toEqual(result);
      expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should throw an error if upload fails', async () => {
      const body = new File(['content'], 'test.txt', { type: 'text/plain' });
      const directory = DirectoriesEnum.TEST;

      jest.spyOn(s3Client, 'send').mockImplementationOnce(() => {
        throw new Error('Upload failed');
      });

      await expect(service.uploadFile(body, directory)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const key = 'example/key.txt';

      jest
        .spyOn(s3Client, 'send')
        .mockImplementationOnce(() => Promise.resolve());

      await service.deleteFile(key);
      expect(s3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand),
      );
    });

    it('should throw an error if delete fails', async () => {
      const key = 'example/key.txt';

      jest.spyOn(s3Client, 'send').mockImplementationOnce(() => {
        throw new Error('Delete failed');
      });

      await expect(service.deleteFile(key)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getFile', () => {
    it('should retrieve a file successfully', async () => {
      const key = 'example/key.txt';
      const result = { Body: 'file content' };

      jest
        .spyOn(s3Client, 'send')
        .mockImplementationOnce(() => Promise.resolve(result));

      const response = await service.getFile(key);
      expect(response).toEqual(result);
      expect(s3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
    });

    it('should throw an error if retrieval fails', async () => {
      const key = 'example/key.txt';

      jest.spyOn(s3Client, 'send').mockImplementationOnce(() => {
        throw new Error('Retrieve failed');
      });

      await expect(service.getFile(key)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
