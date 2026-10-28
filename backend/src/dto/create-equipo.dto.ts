
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

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @IsEnum(EstadoEquipo)
  estado: EstadoEquipo;

  @IsDateString()
  fechaAdquisicion: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
