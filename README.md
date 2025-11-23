
# Guia para rodar o zendaBot com Docker Compose

Este guia explica como rodar o projeto **zendaBot** utilizando Docker Compose, incluindo backend, frontend e banco de dados PostgreSQL.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- Git para clonar o repositório

## Passos

### 1. Clonar o repositório

```bash
git clone https://github.com/MateusMonteiroDV/zendaBot.git
cd zendaBot
```

### 2. Criar arquivo `.env` (opcional)

Se houver variáveis de ambiente, crie um arquivo `.env` na raiz do projeto:

```env
# Exemplo de variáveis
USER_DATABASE_DEV
HOST_DATABASE_DEV
DB_DATABASE_DEV
PS_DATABASE_DEV
PORT_DATABASE_DEV
```

> **Atenção:** O arquivo `.env` **não deve ser commitado** no Git.

### 3. Rodar o Docker Compose

Na raiz do projeto, execute:

```bash
docker compose up --build
```

- `--build` garante que as imagens sejam construídas antes de rodar.
- Isso vai iniciar os três serviços: **backend**, **frontend** e **db (PostgreSQL)**.

### 4. Acessar os serviços

- **Frontend:** [http://localhost:3000](http://localhost:3000)  
- **Backend:** [http://localhost:5000](http://localhost:5000)  
- **Banco de dados:** PostgreSQL na porta definida no `.env` (default `5432`)

### 5. Parar os serviços

```bash
docker compose down
```

> Isso irá parar e remover os containers, mas os volumes (como o do banco de dados) permanecem.

## Observações

- Se for a primeira vez que você roda o projeto, o Docker fará o download das imagens necessárias e construirá as imagens do backend e frontend.  
- Certifique-se de que as portas `3000`, `5000` e `5432` estejam livres no seu sistema.  
- Todas as alterações feitas localmente dentro do backend e frontend são refletidas automaticamente devido aos **volumes montados** no Docker Compose.
