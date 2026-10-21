import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { File } from 'buffer';
import { getS3Settings } from './blob.provider';
import { Request } from 'express';
import { detectImageType } from './imageType';
import { DirectoriesEnum } from './types';
import * as mime from 'mime-types';

@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private readonly bucket = getS3Settings().bucket;

  constructor(@Inject('AWS_S3') private readonly s3: S3Client) {}

  public generateKey(directory: DirectoriesEnum, mimeType?: string): string {
    const fileId = crypto.randomUUID();
    const extension = mimeType ? mime.extension(mimeType) || 'txt' : 'txt';

    return `${directory}/${fileId}.${extension}`;
  }

  async uploadFile(
    body: File,
    directory: DirectoriesEnum,
  ): Promise<PutObjectCommandOutput> {
    const generatedKey = this.generateKey(directory, body.type);

    try {
      const result = await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: generatedKey,
          // The SDK cannot hash a File's stream in Node, so send the bytes
          Body: Buffer.from(await body.arrayBuffer()),
          ContentType: body.type || undefined,
        }),
      );
      this.logger.log(`File uploaded successfully: ${generatedKey}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  // Stores bytes under a new key in the directory and returns the key
  async uploadBuffer(
    body: Buffer,
    contentType: string,
    directory: DirectoriesEnum,
  ): Promise<string> {
    const key = this.generateKey(directory, contentType);

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
      this.logger.log(`File uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  // Stores an uploaded image after checking from its bytes that it is one; returns its key and the URL
  // browsers load it from
  async uploadImage(
    file: { buffer?: Buffer } | undefined,
    directory: DirectoriesEnum,
    request: Request,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Send the image as a file form field');
    }

    const contentType = detectImageType(file.buffer);

    if (!contentType) {
      throw new BadRequestException(
        'Only PNG, JPEG, GIF and WebP images can be uploaded',
      );
    }

    const key = await this.uploadBuffer(file.buffer, contentType, directory);

    return { key, url: `${publicApiUrl(request)}/files/${key}` };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async getFile(
    key: string,
    additionalParams?: Omit<GetObjectCommandInput, 'Bucket' | 'Key'>,
  ): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...additionalParams,
    });

    try {
      const result = await this.s3.send(command);
      this.logger.log(`File retrieved successfully: ${key}`);
      return result;
    } catch (error) {
      if (
        error?.name === 'NoSuchKey' ||
        error?.$metadata?.httpStatusCode === 404
      ) {
        throw new NotFoundException('File not found');
      }

      this.logger.error(`Failed to retrieve file: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve file');
    }
  }
}

// Where browsers reach this API: API_PUBLIC_URL behind a proxy that changes the path, otherwise the
// address of the request
export function publicApiUrl(request: Request) {
  return (
    process.env.API_PUBLIC_URL?.replace(/\/+$/, '') ||
    `${request.protocol}://${request.get('host')}`
  );
}
