import { IsString, IsArray, IsNotEmpty, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class VoiceContractDto {
  @IsString()
  @IsNotEmpty()
  tone: string;

  @IsString()
  @IsNotEmpty()
  format: string;

  @IsString()
  @IsNotEmpty()
  vocabulary: string;

  @IsString()
  @IsNotEmpty()
  forbiddenPhrases: string;
}

export class PersonaDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsArray()
  @IsString({ each: true })
  stableInterests: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => VoiceContractDto)
  voiceContract: VoiceContractDto;
}

export class InitAgentDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PersonaDto)
  persona: PersonaDto;
}
