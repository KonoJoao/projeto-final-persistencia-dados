# Sistema de Pontos Turísticos e Hospedagens

Aplicação web para pesquisa e avaliação de pontos turísticos e hospedagens, permitindo que usuários compartilhem experiências através de avaliações e comentários.

## Tecnologias Utilizadas

### Backend

- **NestJS** - Framework Node.js para construção de APIs escaláveis
- **TypeORM** - ORM para gerenciamento de banco de dados relacional
- **PostgreSQL** - Banco de dados relacional para dados estruturados
- **MongoDB** - Banco de dados NoSQL para fotos e comentários
- **Redis** - Cache em memória para otimização de consultas

### Frontend

- **React** - Biblioteca JavaScript para interfaces de usuário

## Funcionalidades

- Pesquisa de pontos turísticos e hospedagens
- Sistema de avaliações de usuários
- Comentários com respostas aninhadas
- Upload de fotos
- Geolocalização de pontos turísticos
- Exportação/Importação de dados (JSON, CSV, XML)

## Como Rodar o Projeto

### Pré-requisitos

- Docker
- Docker Compose

### Executando a aplicação

1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd projeto-final-persistencia-dados
```

2. Inicie os containers

```bash
docker-compose up --build
```

3. Acesse as aplicações:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger (Documentação da API)**: http://localhost:3001/api

### Serviços incluídos no Docker Compose

| Serviço    | Porta | Descrição                 |
| ---------- | ----- | ------------------------- |
| Frontend   | 3000  | Interface React           |
| Backend    | 3001  | API NestJS                |
| PostgreSQL | 5432  | Banco de dados relacional |
| MongoDB    | 27017 | Banco de dados NoSQL      |
| Redis      | 6379  | Cache                     |

## Parando a aplicação

```bash
docker-compose down
```

Para remover também os volumes (dados persistidos):

```bash
docker-compose down -v
```
