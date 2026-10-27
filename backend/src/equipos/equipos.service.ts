
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from '../entities/equipo.entity';
import { CreateEquipoDto } from '../dto/create-equipo.dto';
import { UpdateEquipoDto } from '../dto/update-equipo.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo)
    private equiposRepository: Repository<Equipo>,
  ) {}

  async findAll(): Promise<Equipo[]> {
    return this.equiposRepository.find();
  }

  async findOne(id: number): Promise<Equipo> {
    const equipo = await this.equiposRepository.findOneBy({ id });

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    return equipo;
  }

  async create(createEquipoDto: CreateEquipoDto): Promise<Equipo> {
    const equipo = this.equiposRepository.create(createEquipoDto);
    return this.equiposRepository.save(equipo);
  }

  async update(
    id: number,
    updateEquipoDto: UpdateEquipoDto,
  ): Promise<Equipo> {
    const equipo = await this.findOne(id);
    Object.assign(equipo, updateEquipoDto);

    return this.equiposRepository.save(equipo);
  }

  async remove(id: number): Promise<void> {
    const equipo = await this.findOne(id);
    await this.equiposRepository.remove(equipo);
  }
}
