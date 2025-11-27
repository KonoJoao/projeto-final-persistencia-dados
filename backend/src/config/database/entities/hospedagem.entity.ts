import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PontoTuristico } from './ponto-turistico.entity';

export enum TipoHospedagem {
  HOTEL = 'hotel',
  POUSADA = 'pousada',
  HOSTEL = 'hostel',
}

@Entity('hospedagem')
export class Hospedagem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ponto_id' })
  ponto_id: string;

  @ManyToOne(() => PontoTuristico, (ponto) => ponto.hospedagens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ponto_id' })
  ponto: PontoTuristico;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 500 })
  endereco: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  preco_medio: number;

  @Column({
    type: 'enum',
    enum: TipoHospedagem,
  })
  tipo: TipoHospedagem;

  @Column({ length: 500, nullable: true })
  link_reserva: string;
}
