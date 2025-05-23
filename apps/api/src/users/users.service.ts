import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  BaseActionResponse,
  BaseUserResponseType,
  UserResponsesEnum,
} from '^tournament-app/types';
import { UserDrizzleRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import {
  CreateUserRequest,
  UpdateUserInfo,
  UserQuery,
} from './dto/requests.dto';
import { ExtendedUserResponse } from './dto/responses.dto';
import { AnyUserReturnType, UserReturnTypesEnumType } from './types';
import {
  EmailGenerationData,
  ResetPasswordInfo,
  VerifyEmailInfo,
} from 'src/infrastructure/types';
import { TemplatesEnum } from 'src/infrastructure/types';
import { EmailService } from 'src/infrastructure/email/email.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UserDrizzleRepository,
    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserRequest) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    createUserDto.password = hashedPassword;

    const action: BaseActionResponse[] = (await this.repository.createEntity(
      createUserDto,
    )) as BaseActionResponse[];

    if (!action || !action[0]) {
      throw new UnprocessableEntityException('User creation failed');
    }

    if (createUserDto.isFake) {
      return action[0];
    }

    const token = await this.repository.insertEmailConfirmationToken(
      crypto.randomUUID(),
      action[0].id,
    );

    if (!token || !token[0]) {
      throw new UnprocessableEntityException(
        'Email confirmation token creation failed',
      );
    }

    try {
      await this.sendEmailConfirmationEmail({
        link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/email-confirmation/${token[0].emailConfirmationToken}`,
        email: token[0].email,
        username: token[0].username,
      });
    } catch (error) {
      await this.remove(action[0].id);
      throw new InternalServerErrorException(
        'Error sending email confirmation email',
      );
    }

    return action[0];
  }

  async sendEmailConfirmationEmail(data: VerifyEmailInfo) {
    const sendObject: EmailGenerationData = {
      to: data.email,
      subject: 'Email Confirmation',
      template: TemplatesEnum.EMAIL_CONFIRMATION,
      data: data,
    };

    await this.emailService.generateAndSendEmail(sendObject);
  }

  async confirmUserEmail(token: string) {
    const action = await this.repository.confirmUserEmail(token);

    if (!action || !action[0]) {
      throw new NotFoundException('User not found');
    }

    return action[0];
  }

  async findAll<TResponseType extends AnyUserReturnType>(query: UserQuery) {
    const queryFunction = this.repository.getQuery(query);
    const results = await queryFunction;

    return results as TResponseType[];
  }

  async findOne<TResponseType extends AnyUserReturnType = ExtendedUserResponse>(
    id: number,
    responseType: UserReturnTypesEnumType = UserResponsesEnum.EXTENDED,
  ) {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results || results.length === 0) {
      throw new NotFoundException('User not found');
    }

    return results[0] as TResponseType;
  }

  async findOneIncludingFake<
    TResponseType extends AnyUserReturnType = ExtendedUserResponse,
  >(
    id: number,
    responseType: UserReturnTypesEnumType = UserResponsesEnum.EXTENDED,
  ) {
    const results = await this.repository.getSingleQueryIncludingFake(
      id,
      responseType,
    );

    if (results.length === 0) {
      throw new NotFoundException('User not found');
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateUserDto: UpdateUserInfo) {
    const action = await this.repository.updateEntity(id, updateUserDto);

    if (!action || !action[0]) {
      throw new NotFoundException('User update failed');
    }

    return action[0];
  }

  async findOneByEmail<
    TResponseType extends AnyUserReturnType = BaseUserResponseType,
  >(
    email: string,
    responseType?: UserReturnTypesEnumType,
  ): Promise<TResponseType> {
    const query = this.repository.getQuery({
      email,
      responseType: responseType || UserResponsesEnum.BASE,
    });

    const results = await query;

    if (!results || results.length === 0) {
      throw new NotFoundException('User not found');
    }

    return results[0] satisfies TResponseType;
  }

  async setPasswordResetTokenAndSendEmail(email: string) {
    const { token, expiresAt } = await this.generatePasswordResetToken();

    const action = await this.repository.insertPaswordResetToken(
      token,
      email,
      expiresAt,
    );

    if (!action || !action[0]) {
      throw new UnprocessableEntityException(
        'Password reset token creation failed',
      );
    }

    await this.emailService.generateAndSendEmail({
      to: email,
      subject: 'Password Reset',
      template: TemplatesEnum.RESET_PASSWORD,
      data: {
        username: action[0].username,
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`,
        email: action[0].email,
      } as ResetPasswordInfo,
    });
  }

  async resetPassword(token: string, password: string) {
    const action = await this.repository.resetPassword(token, password);

    if (!action || !action[0]) {
      throw new UnprocessableEntityException('Password reset failed');
    }

    return action[0];
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action || !action[0]) {
      throw new NotFoundException('User removal failed or user not found');
    }

    return action[0];
  }

  async generatePasswordResetToken() {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day
    return { token, expiresAt };
  }

  async userAutoComplete(search: string, pageSize: number = 10) {
    return this.repository.userAutoComplete(search, pageSize);
  }
}
