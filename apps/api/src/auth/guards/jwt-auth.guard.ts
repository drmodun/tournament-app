import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// A login token (JWT) or a personal access token (`wsh_…`)
@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt', 'api-token']) {}
