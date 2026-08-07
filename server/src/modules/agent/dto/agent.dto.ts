import { IsString, IsArray, IsNotEmpty, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PersonaVoiceDto {
  @IsString()
  @IsNotEmpty()
  tone: string;

  @IsString()
  @IsNotEmpty()
  sentenceStyle: string;

  @IsArray()
  @IsString({ each: true })
  signatureMoves: string[];
}

export class EditorialStandardsDto {
  @IsArray()
  @IsString({ each: true })
  rejectIf: string[];

  @IsArray()
  @IsString({ each: true })
  preferIf: string[];
}

export class PersonaDto {
  @IsString()
  @IsOptional()
  id?: string;

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
  @Type(() => PersonaVoiceDto)
  voice: PersonaVoiceDto;

  @IsObject()
  @ValidateNested()
  @Type(() => EditorialStandardsDto)
  editorialStandards: EditorialStandardsDto;
}

export class InitAgentDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PersonaDto)
  persona: PersonaDto;
}
