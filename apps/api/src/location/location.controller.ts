import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LocationService } from './location.service';
import {
  CreateLocationDto,
  LocationQuery,
  UpdateLocationDto,
} from './dto/requests';
import {
  ExtendedLocationResponse,
  LocationResponse,
  MiniLocationResponse,
  locationQueryResponses,
  locationResponses,
} from './dto/responses';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LocationResponsesEnum, IQueryMetadata } from '@tournament-app/types';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('locations')
@ApiExtraModels(
  MiniLocationResponse,
  LocationResponse,
  ExtendedLocationResponse,
)
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('map')
  @ApiOkResponse({
    description: 'Returns all locations unpaginated ',
    type: ActionResponsePrimary,
  })
  async getMap() {
    return await this.locationService.getMap();
  }

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: locationQueryResponses.responses,
      },
    },
  })
  async findAll(@Query() query: LocationQuery, @Req() req: Request) {
    const results = await this.locationService.findAll(query);

    const metadata: IQueryMetadata = MetadataMaker.makeMetadataFromQuery(
      query,
      results,
      req.url,
    );

    return {
      results,
      metadata,
    };
  }

  @Get(':locationId')
  @ApiOkResponse({
    description: 'Returns a single location',
    schema: { examples: locationResponses },
  })
  async findOne(
    @Param('locationId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: LocationResponsesEnum,
  ) {
    return await this.locationService.findOne(id, responseType);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new location',
    type: ActionResponsePrimary,
  })
  async create(@Body() createLocationDto: CreateLocationDto) {
    return await this.locationService.create(createLocationDto);
  }

  @Patch(':locationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates a location',
    type: ActionResponsePrimary,
  })
  async update(
    @Param('locationId', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return await this.locationService.update(id, updateLocationDto);
  }

  @Delete(':locationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes a location',
    type: ActionResponsePrimary,
  })
  async remove(@Param('locationId', ParseIntPipe) id: number) {
    return await this.locationService.remove(id);
  }
}
