
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

export enum EstadoEquipo {
  DISPONIBLE = 'Disponible',
  EN_USO = 'En uso',
  MANTENCION = 'Mantención',
  BAJA = 'Baja',
}

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  codigoInventario: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  tipo: string;

  @Column({ length: 100, nullable: true })
  marca: string;

  @Column({ length: 100, nullable: true })
  modelo: string;

  @Column({ length: 150, nullable: true })
  ubicacion: string;

  @Column({
    type: 'enum',
    enum: EstadoEquipo,
    default: EstadoEquipo.DISPONIBLE,
  })
  estado: EstadoEquipo;

  @Column({ type: 'date' })
  fechaAdquisicion: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
}
