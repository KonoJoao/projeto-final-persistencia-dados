import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PontoTuristico } from './ponto-turistico.entity';
import { Avaliacao } from './avaliacao.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  login: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  senha_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => PontoTuristico, (ponto) => ponto.criador)
  pontos_turisticos: PontoTuristico[];

  @OneToMany(() => Avaliacao, (avaliacao) => avaliacao.usuario)
  avaliacoes: Avaliacao[];
}
