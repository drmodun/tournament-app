import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinDate,
  MinLength,
} from "class-validator";
import { tournamentTeamTypeEnum, tournamentTeamTypeEnumType } from "src/enums";

export class CreateTournament {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(300)
  description: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsDate()
  @MinDate(new Date())
  startDate: Date;

  @IsDate()
  @MinDate(new Date())
  endDate: Date; // TODO: implement date check

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsArray()
  @IsString({ each: true })
  links: string[];

  @IsOptional()
  @IsEnum(tournamentTeamTypeEnum)
  tournamentType: tournamentTeamTypeEnumType;

  @IsOptional()
  @IsInt()
  minimumMMR: number;

  @IsOptional()
  @IsInt()
  maximumMMR: number;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsInt()
  maxParticipants: string;

  @IsInt()
  categoryId: string;
}
