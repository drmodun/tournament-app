import { Module } from '@nestjs/common';
import { BlobService } from './blob.service';
import { AwsS3Provider } from './blob.provider';

@Module({
  providers: [BlobService, AwsS3Provider],
  exports: [BlobService],
})
export class BlobModule {}
