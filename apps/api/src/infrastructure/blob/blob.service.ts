import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { File } from 'buffer';

@Injectable()
export class BlobService {
  constructor(@Inject('AWS_S3') private readonly s3: S3Client) {}

  async uploadFile(bucket: string, key: string, body: File): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
      }),
    );
  }

  //TODO: add other funcs later
}
