import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Readable } from 'stream';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BlobService } from './blob.service';
import { detectImageType, MAX_IMAGE_BYTES } from './imageType';
import { DirectoriesEnum, UPLOAD_DIRECTORIES } from './types';

const FILE_NAME = /^[0-9a-f-]{36}\.[a-z0-9]+$/;

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly blobService: BlobService) {}

  @Post(':directory')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkResponse({
    description:
      'Stores a PNG, JPEG, GIF or WebP image of up to 5 MB and returns its URL, to put in a logo, avatar or cover field',
    schema: {
      example: {
        key: 'avatar/0b6f1c1e-6c1f-4a8e-9d55-3f4e2b8a1c2d.png',
        url: 'https://example.com/api/files/avatar/0b6f1c1e-6c1f-4a8e-9d55-3f4e2b8a1c2d.png',
      },
    },
  })
  async upload(
    @Param('directory') directory: string,
    @UploadedFile() file: { buffer?: Buffer } | undefined,
    @Req() request: Request,
  ) {
    if (!UPLOAD_DIRECTORIES.includes(directory)) {
      throw new BadRequestException(
        `Uploads go to one of: ${UPLOAD_DIRECTORIES.join(', ')}`,
      );
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('Send the image as the "file" form field');
    }

    const contentType = detectImageType(file.buffer);

    if (!contentType) {
      throw new BadRequestException(
        'Only PNG, JPEG, GIF and WebP images can be uploaded',
      );
    }

    const key = await this.blobService.uploadBuffer(
      file.buffer,
      contentType,
      directory as DirectoriesEnum,
    );

    return { key, url: `${this.publicApiUrl(request)}/files/${key}` };
  }

  @Get(':directory/:name')
  @ApiOkResponse({ description: 'An uploaded image' })
  async download(
    @Param('directory') directory: string,
    @Param('name') name: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!UPLOAD_DIRECTORIES.includes(directory) || !FILE_NAME.test(name)) {
      throw new BadRequestException('Not an uploaded file');
    }

    const file = await this.blobService.getFile(`${directory}/${name}`);

    response.set({
      'Content-Type': file.ContentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
      ...(file.ContentLength != null
        ? { 'Content-Length': String(file.ContentLength) }
        : {}),
    });

    return new StreamableFile(file.Body as Readable);
  }

  // Where browsers reach this API: API_PUBLIC_URL behind a proxy that changes the path, otherwise the
  // address of the request
  private publicApiUrl(request: Request) {
    return (
      process.env.API_PUBLIC_URL?.replace(/\/+$/, '') ||
      `${request.protocol}://${request.get('host')}`
    );
  }
}
