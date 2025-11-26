import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { MESSAGES } from 'src/shared/messages';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'testuser',
    required: true,
    type: String,
    minLength: 3,
    maxLength: 20,
  })
  @ValidateIf((dto: CreateUserDto) => !dto.email, {
    message: MESSAGES.ERR_REQUIRED,
  })
  @IsString({
    message: MESSAGES.ERR_MUST_BE_A_STRING,
  })
  @IsNotEmpty({
    message: MESSAGES.ERR_REQUIRED,
  })
  @MinLength(3, {
    message: MESSAGES.ERR_MIN_LENGTH,
  })
  @MaxLength(20, {
    message: MESSAGES.ERR_MAX_LENGTH,
  })
  username: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'test@example.com',
    format: 'email',
    required: true,
    type: String,
  })
  @ValidateIf((dto: CreateUserDto) => !dto.username, {
    message: MESSAGES.ERR_REQUIRED,
  })
  @IsEmail(
    {},
    {
      message: MESSAGES.ERR_EMAIL_FORMAT,
    },
  )
  @IsNotEmpty({
    message: MESSAGES.ERR_REQUIRED,
  })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Taf@2025',
    format: 'password',
    required: true,
    type: String,
    minLength: 8,
    maxLength: 20,
  })
  @IsString({
    message: MESSAGES.ERR_MUST_BE_A_STRING,
  })
  @IsNotEmpty({
    message: MESSAGES.ERR_REQUIRED,
  })
  @MinLength(8, {
    message: MESSAGES.ERR_MIN_LENGTH,
  })
  password: string;
}
