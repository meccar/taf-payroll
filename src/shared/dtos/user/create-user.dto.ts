import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'testuser',
    required: true,
    type: String,
    minLength: 3,
    maxLength: 20,
  })
  @ValidateIf((dto: CreateUserDto) => !dto.email)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'test@example.com',
    format: 'email',
    required: true,
    type: String,
  })
  @ValidateIf((dto: CreateUserDto) => !dto.username)
  @IsEmail()
  @IsNotEmpty()
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
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
