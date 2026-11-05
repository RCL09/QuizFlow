# QuizFlow — Backend

API responsável pelo processamento das funcionalidades do QuizFlow, desenvolvida com Node.js, Express, TypeScript, Prisma ORM e PostgreSQL.

## 1. Sobre o backend

O backend do QuizFlow é responsável por conectar a interface do aplicativo ao banco de dados e executar as regras de negócio da plataforma.

Sua função é receber as requisições realizadas pelo frontend, validar informações, autenticar usuários, processar dados e armazenar os registros no PostgreSQL.

A API será utilizada tanto pelo ambiente dos alunos quanto pelo painel de gerenciamento dos professores.

## 2. Responsabilidades

- Realizar o cadastro de alunos e professores.
- Autenticar usuários por e-mail e senha.
- Controlar permissões de acesso conforme o perfil.
- Gerenciar turmas e vínculos entre alunos e professores.
- Gerenciar atividades e perguntas.
- Processar respostas e calcular pontuações.
- Registrar os resultados das atividades.
- Disponibilizar informações para os relatórios.
- Garantir a integridade e a segurança dos dados.

## 3. Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Node.js | Ambiente de execução |
| TypeScript | Linguagem de desenvolvimento |
| Express | Construção da API |
| Prisma ORM | Comunicação com o banco de dados |
| PostgreSQL | Banco de dados relacional |
| JWT | Autenticação e identificação de sessões |
| bcrypt | Hash e proteção de senhas |
| tsx | Execução do TypeScript durante o desenvolvimento |

## 4. Estrutura de pastas

```text
backend/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── generated/
│   ├── routes/
│   │   └── auth.routes.ts
│   ├── prisma.ts
│   └── server.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

### Principais arquivos

- `server.ts`: inicialização do servidor Express e configuração das rotas.
- `prisma.ts`: configuração do acesso ao banco de dados utilizando Prisma.
- `auth.routes.ts`: rotas responsáveis pelo cadastro e login dos usuários.
- `schema.prisma`: definição dos modelos, campos e relacionamentos do banco.
- `prisma.config.ts`: configurações do Prisma.
- `migrations/`: histórico das alterações realizadas na estrutura do banco.
- `generated/`: cliente gerado pelo Prisma para realizar consultas ao banco.

A pasta `src/generated/prisma` é criada pelo comando `npx prisma generate`. Não edite os arquivos gerados manualmente.

## 5. Requisitos para execução

Antes de iniciar o backend, é necessário ter instalado:

- Node.js 22.18 ou superior.
- npm.
- PostgreSQL.
- Editor de código, preferencialmente VS Code.

Versões utilizadas durante a configuração:

```text
Node.js: 26.13.0
Prisma: 7.10.1
PostgreSQL: 5432 (porta padrão)
Backend: 3000
```

É possível utilizar versões compatíveis mais recentes das dependências, respeitando os requisitos do Prisma 7.

## 6. Instalação do projeto

Após clonar o repositório ou receber os arquivos do projeto, abra o terminal dentro da pasta `backend`.

Instale as dependências:

```bash
npm install
```

Esse comando instalará as bibliotecas necessárias para executar a API.

## 7. Configuração do PostgreSQL

O QuizFlow utiliza PostgreSQL para armazenar suas informações.

### 7.1. Iniciar o PostgreSQL

No Windows, o PostgreSQL normalmente é executado como um serviço do sistema.

Para verificar:

1. Pressione `Win + R`.
2. Digite `services.msc`.
3. Procure o serviço PostgreSQL.
4. Confira se o status está como `Em execução`.

Caso esteja parado, clique com o botão direito e selecione `Iniciar`.

O pgAdmin e o DBeaver são ferramentas gráficas para administrar o banco. Não é necessário mantê-las abertas para que o PostgreSQL funcione.

### 7.2. Criar o banco

Utilize o pgAdmin, DBeaver ou o terminal do PostgreSQL para criar um banco com o nome:

```text
quizflow
```

Caso esteja utilizando um banco hospedado, utilize as informações de conexão fornecidas pelo serviço.

### 7.3. Configurar o arquivo .env

Dentro da pasta `backend`, crie um arquivo chamado `.env`.

Você pode utilizar o `.env.example` como modelo.

No PowerShell:

```powershell
Copy-Item .env.example .env
```

No macOS/Linux:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/quizflow?schema=public"

JWT_SECRET="SUA_CHAVE_SECRETA"

PORT=3000
```

Substitua:

- `postgres`: pelo usuário do PostgreSQL.
- `SUA_SENHA`: pela senha configurada no PostgreSQL.
- `JWT_SECRET`: por uma chave aleatória e segura.
- `3000`: pela porta desejada para a API, caso necessário.

### 7.4. Gerar a chave JWT

Para gerar uma chave aleatória, execute:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado para a variável `JWT_SECRET`.

**Importante:** o arquivo `.env` contém informações sensíveis e não deve ser enviado ao GitHub. Apenas o `.env.example`, sem credenciais reais, deve ser versionado.

## 8. Configuração do Prisma ORM

O Prisma ORM é responsável por realizar a comunicação entre a API e o PostgreSQL.

Após instalar as dependências e configurar o banco, execute:

```bash
npx prisma generate
```

Esse comando gera o Prisma Client, utilizado pelo backend para realizar consultas e operações no banco.

### 8.1. Aplicar as migrações

O Prisma utiliza migrações para manter a estrutura do banco de dados sincronizada com o arquivo `schema.prisma`.

Se o projeto já possui o histórico de migrações versionado no GitHub, execute:

```bash
npx prisma migrate dev
```

Esse comando aplica as migrações pendentes ao banco de dados.

Caso seja a primeira migração de um projeto sem histórico de migrações, utilize:

```bash
npx prisma migrate dev --name init
```

Quando uma alteração for realizada no `schema.prisma`, uma nova migração deverá ser criada com um nome que identifique a mudança.

Exemplo:

```bash
npx prisma migrate dev --name nome_da_alteracao
```

Em ambientes de implantação, utilize:

```bash
npx prisma migrate deploy
```

**Atenção:** não apague a pasta `prisma/migrations` ao atualizar o projeto. Ela armazena o histórico de alterações do banco.

## 9. Executar o backend

Com as dependências instaladas, o arquivo `.env` configurado e o PostgreSQL funcionando, inicie o servidor:

```bash
npm run dev
```

O comando utiliza o modo de desenvolvimento do projeto, permitindo reinicializações automáticas quando arquivos são modificados.

O terminal deverá apresentar mensagens semelhantes a:

```text
QuizFlow API rodando em http://localhost:3000
Verificação: http://localhost:3000/api/health
```

O backend estará disponível na porta 3000.

Para iniciar sem o modo de observação, utilize:

```bash
npm start
```

## 10. Verificar se a API está funcionando

Acesse pelo navegador:

```text
http://localhost:3000/api/health
```

Ou execute no PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Resposta esperada:

```json
{
  "api": "online",
  "database": "connected"
}
```

Essa rota permite verificar se a API está ativa e se consegue acessar o banco PostgreSQL.

## 11. Rotas da API

As rotas principais de autenticação são:

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/health` | Verifica o funcionamento da API e do banco |
| POST | `/api/auth/register` | Realiza o cadastro de usuários |
| POST | `/api/auth/login` | Realiza a autenticação dos usuários |

### 11.1. Cadastro de aluno

Endpoint:

```text
POST /api/auth/register
```

Exemplo de requisição:

```json
{
  "name": "Ana Oliveira",
  "email": "ana@email.com",
  "password": "senha123",
  "role": "aluno"
}
```

O cadastro do aluno não exige código de turma. O vínculo com turmas será realizado posteriormente, por meio de uma funcionalidade própria.

### 11.2. Cadastro de professor

Endpoint:

```text
POST /api/auth/register
```

Exemplo de requisição:

```json
{
  "name": "Carlos Silva",
  "email": "carlos@email.com",
  "password": "senha123",
  "role": "professor",
  "schoolName": "Instituição de Ensino"
}
```

O professor informa a instituição de ensino durante o cadastro.

### 11.3. Login

Endpoint:

```text
POST /api/auth/login
```

Exemplo de requisição:

```json
{
  "email": "ana@email.com",
  "password": "senha123",
  "role": "aluno"
}
```

O perfil informado deve corresponder ao perfil cadastrado para aquele usuário.

As senhas são armazenadas utilizando hash bcrypt, e a autenticação utiliza tokens JWT.

## 12. Modelo de dados atual

O modelo de usuário contempla as informações necessárias para identificar os usuários da plataforma.

| Campo | Descrição |
|---|---|
| id | Identificador único do usuário |
| name | Nome completo |
| email | E-mail utilizado no acesso |
| passwordHash | Hash da senha |
| role | Perfil: aluno ou professor |
| schoolName | Instituição de ensino, quando aplicável |
| createdAt | Data de criação do registro |
| updatedAt | Data da última atualização |

O código da turma não faz parte do cadastro do aluno.

As entidades de turmas, atividades, perguntas, respostas e resultados serão desenvolvidas nas próximas etapas do projeto.

## 13. Funcionalidades previstas para o backend

Além das rotas iniciais de autenticação, o backend deverá disponibilizar recursos para:

- Gerenciamento de turmas pelos professores.
- Associação de alunos às turmas.
- Criação e edição de atividades.
- Publicação de atividades para turmas específicas.
- Cadastro de perguntas e alternativas.
- Configuração de gabaritos e pontuações.
- Registro das respostas dos alunos.
- Correção automática das atividades.
- Geração de relatórios individuais e coletivos.
- Histórico de resultados e participação.

## 14. Regras de negócio

O backend deverá garantir:

1. Cada professor poderá gerenciar somente suas próprias turmas e atividades.
2. As atividades publicadas deverão estar associadas a uma turma.
3. Os alunos só poderão acessar atividades destinadas às turmas das quais participam.
4. Atividades incompletas não poderão ser publicadas.
5. As respostas deverão ser corrigidas conforme o gabarito configurado pelo professor.
6. A pontuação deverá respeitar as regras definidas para cada questão.
7. Os resultados deverão ser associados ao aluno, à atividade e à turma.
8. Atividades em rascunho não poderão ser acessadas pelos alunos.
9. Os relatórios deverão refletir os resultados registrados.
10. Os dados deverão ser protegidos conforme as permissões de cada perfil.

## 15. Segurança

Algumas medidas importantes para o desenvolvimento e a implantação:

- Não armazenar senhas em texto puro.
- Utilizar bcrypt para proteger as senhas.
- Utilizar JWT para autenticação.
- Validar os dados recebidos pelas rotas.
- Restringir o acesso conforme o perfil do usuário.
- Não compartilhar arquivos `.env`.
- Não expor diretamente as credenciais do PostgreSQL.
- Configurar CORS adequadamente antes da publicação.

O cadastro de professor está habilitado nesta etapa. Antes da disponibilização pública, deverá ser avaliada a necessidade de convites ou aprovação institucional.

---

**QuizFlow — Backend e API**