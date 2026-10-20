import { detectImageType } from '../imageType';

describe('detectImageType', () => {
  it('recognises PNG, JPEG, GIF and WebP by their first bytes', () => {
    expect(
      detectImageType(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13]),
      ),
    ).toBe('image/png');
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0]))).toBe(
      'image/jpeg',
    );
    expect(detectImageType(Buffer.from('GIF89a......', 'latin1'))).toBe(
      'image/gif',
    );
    expect(detectImageType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'latin1'))).toBe(
      'image/webp',
    );
  });

  it('rejects anything else, SVG and HTML included', () => {
    expect(detectImageType(Buffer.from('<svg xmlns="..."></svg>'))).toBeNull();
    expect(detectImageType(Buffer.from('<html><script>'))).toBeNull();
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
  });
});
