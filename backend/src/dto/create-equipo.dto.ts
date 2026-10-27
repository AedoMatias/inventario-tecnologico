
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
} from 'class-validator';
import { EstadoEquipo } from '../entities/equipo.entity';

export class CreateEquipoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  codigoInventario: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  tipo: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsEnum(EstadoEquipo)
  estado: EstadoEquipo;

  @IsDateString()
  fechaAdquisicion: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
