import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PontoTuristico } from './ponto-turistico.entity';
import { Usuario } from './usuario.entity';

@Entity('avaliacao')
export class Avaliacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ponto_id' })
  ponto_id: string;

  @ManyToOne(() => PontoTuristico, (ponto) => ponto.avaliacoes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ponto_id' })
  ponto: PontoTuristico;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.avaliacoes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column('int')
  nota: number;

  @Column('text')
  comentario: string;

  @CreateDateColumn()
  created_at: Date;
}
