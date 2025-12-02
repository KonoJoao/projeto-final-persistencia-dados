import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Hospedagem } from './hospedagem.entity';
import { Avaliacao } from './avaliacao.entity';

@Entity('ponto_turistico')
export class PontoTuristico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nome: string;

  @Column('text')
  descricao: string;

  @Column({ length: 100 })
  cidade: string;

  @Column({ length: 100 })
  estado: string;

  @Column({ length: 100 })
  pais: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column({ length: 500 })
  endereco: string;

  @Column({ name: 'criado_por' })
  criado_por: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.pontos_turisticos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'criado_por' })
  criador: Usuario;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Hospedagem, (hospedagem) => hospedagem.ponto)
  hospedagens: Hospedagem[];

  @OneToMany(() => Avaliacao, (avaliacao) => avaliacao.ponto)
  avaliacoes: Avaliacao[];
}
