import { Module } from '@nestjs/common';
import { BlobService } from './blob.service';
import { AwsS3Provider } from './blob.provider';
import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
  providers: [BlobService, AwsS3Provider],

  exports: [BlobService],
})
export class BlobModule {}
