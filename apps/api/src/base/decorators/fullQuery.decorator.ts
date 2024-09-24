import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { BaseQueryType } from '@tournament-app/types';

//TODO: make this a pagination and sorting checker
