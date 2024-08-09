import { IsEmail, IsString, Max, Min } from "class-validator";

export class CreateUserRequest {
  @IsString()
  @Min(3)
  @Max(30)
  name: string;

  @IsString()
  @Min(3)
  @Max(30)
  username: string;

  @IsEmail()
  email: string;

  
}
