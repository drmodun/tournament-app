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
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { File } from 'buffer';
import { DirectoriesEnum } from './types';
import * as mime from 'mime-types';

@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private readonly bucket = process.env.AWS_S3_BUCKET;

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
          Body: body,
        }),
      );
      this.logger.log(`File uploaded successfully: ${generatedKey}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
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
      this.logger.error(`Failed to retrieve file: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve file');
    }
  }

  //TODO: add other funcs later like multipart upload, etc
}
