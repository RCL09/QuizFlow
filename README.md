# QuizFlow

**Plataforma de Aprendizagem Gamificada**

## 1. Sobre o projeto

O QuizFlow é uma plataforma educacional gamificada desenvolvida para tornar as atividades escolares mais interativas e facilitar o acompanhamento do desempenho dos alunos.

A proposta é permitir que professores criem atividades utilizando perguntas em formatos de minijogos, organizem seus alunos em turmas e acompanhem os resultados por meio de relatórios individuais e coletivos.

Para os alunos, a plataforma oferece um ambiente de aprendizagem no qual poderão acessar suas turmas, realizar atividades, responder perguntas interativas e acompanhar seus resultados.

O QuizFlow busca unir tecnologia, educação e gamificação para tornar o processo de ensino e aprendizagem mais dinâmico, participativo e organizado.

## 2. Problema

Em métodos tradicionais de ensino, os professores podem enfrentar dificuldades para manter o engajamento dos estudantes, corrigir atividades e identificar os conteúdos nos quais os alunos apresentam maior dificuldade.

Além disso, o acompanhamento individual e coletivo do desempenho pode exigir bastante trabalho manual.

O QuizFlow surge como uma proposta para centralizar essas atividades em uma plataforma, oferecendo ferramentas para criação de avaliações gamificadas, gerenciamento de turmas e análise dos resultados.

## 3. Objetivos

### Objetivo geral

Desenvolver uma plataforma educacional gamificada que facilite a criação e a realização de atividades interativas, além de proporcionar aos professores ferramentas para acompanhar o desempenho dos alunos.

### Objetivos específicos

- Facilitar a criação de atividades educacionais interativas.
- Tornar a resolução de questões mais dinâmica por meio de minijogos.
- Organizar alunos e professores em turmas.
- Automatizar a correção das atividades e o cálculo de pontuações.
- Disponibilizar relatórios individuais e coletivos.
- Permitir o acompanhamento da evolução dos estudantes.
- Centralizar o gerenciamento de atividades e turmas em um único ambiente.

## 4. Público-alvo

O QuizFlow será destinado principalmente a professores e alunos de instituições de ensino, podendo ser utilizado tanto no ensino básico quanto no ensino superior.

### Professores

Serão responsáveis por:

- Criar e administrar turmas.
- Elaborar atividades educacionais.
- Adicionar perguntas e configurar respostas.
- Escolher formatos de minijogos.
- Publicar atividades para turmas específicas.
- Acompanhar o desempenho dos alunos.
- Consultar relatórios individuais e coletivos.

### Alunos

Poderão:

- Acessar as turmas das quais fazem parte.
- Visualizar atividades disponíveis.
- Responder perguntas por meio de minijogos.
- Enviar suas respostas.
- Consultar pontuações e resultados.
- Acompanhar sua evolução na plataforma.

## 5. Funcionalidades principais do MVP

O MVP (Produto Mínimo Viável) do QuizFlow prevê as seguintes funcionalidades:

1. **Cadastro e login:** autenticação de alunos e professores, com permissões específicas para cada perfil.
2. **Gerenciamento de turmas:** criação, edição e organização de turmas pelos professores.
3. **Criação de atividades:** elaboração de atividades com título, descrição, perguntas, alternativas, respostas corretas e pontuação.
4. **Minijogos educacionais:** perguntas de múltipla escolha, verdadeiro ou falso e associação de pares.
5. **Publicação de atividades:** salvamento de rascunhos e publicação para turmas específicas.
6. **Realização de atividades:** acesso dos alunos às atividades disponíveis e envio das respostas.
7. **Correção automática:** correção das respostas e cálculo de pontuação.
8. **Relatórios individuais:** acompanhamento do desempenho de cada aluno.
9. **Relatórios por turma:** visualização de indicadores coletivos, participação e aproveitamento.
10. **Painel do professor:** centralização de turmas, atividades e relatórios.
11. **Histórico de resultados:** armazenamento dos resultados para acompanhamento da evolução dos estudantes.

## 6. Fluxos principais

### Fluxo do professor

1. Realiza o login na plataforma.
2. Acessa o painel principal.
3. Visualiza suas turmas ou cria uma nova.
4. Seleciona uma turma.
5. Acessa a opção de criação de atividade.
6. Define o título e a descrição da atividade.
7. Adiciona perguntas e escolhe os formatos de minijogos.
8. Configura respostas corretas e pontuação.
9. Salva e publica a atividade.
10. Acompanha os resultados dos alunos por meio dos relatórios.

### Fluxo do aluno

1. Realiza o cadastro ou login na plataforma.
2. Acessa sua página inicial.
3. Visualiza as turmas das quais faz parte.
4. Consulta as atividades disponíveis.
5. Seleciona uma atividade.
6. Responde às perguntas por meio dos minijogos.
7. Finaliza e envia suas respostas.
8. Visualiza a pontuação e o feedback permitido pelo professor.

## 7. Identidade visual

A identidade visual do QuizFlow deverá transmitir tecnologia, diversão e organização, mantendo uma interface simples e intuitiva.

Diretrizes visuais:

- **Estilo:** moderno, amigável e intuitivo.
- **Cor principal:** azul.
- **Cores complementares:** branco para fundos e verde para indicadores positivos.
- **Tipografia:** fontes sem serifa, com boa legibilidade.
- **Componentes:** cartões, botões, menus, tabelas, gráficos e indicadores de progresso.
- **Layout:** painel de gerenciamento para professores e interface simplificada para alunos.

A experiência deverá ser adaptada às diferentes plataformas:

- Computadores, especialmente para o gerenciamento dos professores.
- Celulares e tablets, especialmente para o acesso dos alunos às atividades.

## 8. Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| React Native | Desenvolvimento da interface mobile |
| Expo | Execução e gerenciamento do aplicativo |
| TypeScript | Tipagem e organização do código |
| Node.js | Ambiente de execução do backend |
| Express | Desenvolvimento da API |
| Prisma ORM | Comunicação entre backend e banco de dados |
| PostgreSQL | Armazenamento dos dados |
| JWT | Autenticação por tokens |
| bcrypt | Proteção das senhas |
| Git e GitHub | Controle de versão e colaboração |

## 9. Arquitetura do projeto

O QuizFlow é dividido em três partes principais:

**Frontend (Mobile):** responsável pela interface utilizada pelos alunos e professores, incluindo autenticação, navegação e interação com as funcionalidades da plataforma.

**Backend (API):** responsável pelas regras de negócio, autenticação, validação das informações, processamento das atividades e comunicação com o banco de dados.

**Banco de dados:** responsável por armazenar usuários, turmas, atividades, perguntas, respostas e resultados.

## 10. Estrutura do repositório

```text
QuizFlow/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── routes/
│   │   ├── generated/
│   │   ├── prisma.ts
│   │   └── server.ts
│   └── README.md
│
├── mobile/
│   ├── assets/
│   ├── src/
│   │   └── app/
│   └── README.md
│
└── README.md
```

## 11. Regras de negócio

O sistema deverá respeitar as seguintes regras:

- Cada professor poderá gerenciar suas próprias turmas e atividades.
- As atividades publicadas deverão estar associadas a uma turma específica.
- Cada aluno só poderá acessar as turmas das quais participa e as atividades destinadas a ele.
- Uma atividade não poderá ser publicada enquanto possuir perguntas obrigatórias incompletas.
- A correção deverá seguir o gabarito configurado pelo professor.
- A pontuação deverá respeitar os valores definidos para cada pergunta.
- Os resultados deverão ser associados ao aluno, à atividade e à turma.
- Atividades em rascunho não poderão ser acessadas pelos alunos.
- Os relatórios deverão refletir os resultados efetivamente registrados.
- Os dados pessoais e acadêmicos deverão ter acesso restrito aos usuários autorizados.

## 12. Situação atual do desenvolvimento

A implementação está sendo realizada de forma incremental.

### Estrutura inicial implementada

- Organização do projeto em frontend e backend.
- Configuração do ambiente React Native com Expo.
- Configuração da API utilizando Node.js e Express.
- Configuração do PostgreSQL.
- Integração com Prisma ORM.
- Estrutura inicial de cadastro e login para alunos e professores.
- Autenticação utilizando JWT.
- Proteção de senhas com bcrypt.
- Verificação da conexão entre API e banco de dados.

### Próximas funcionalidades

- Painel principal do professor.
- Página inicial do aluno.
- Gerenciamento de turmas.
- Entrada e vínculo de alunos em turmas.
- Criação e publicação de atividades.
- Implementação dos diferentes tipos de minijogos.
- Correção automática e pontuação.
- Relatórios individuais e coletivos.
- Histórico de resultados.

## 13. Critérios de conclusão do MVP

O MVP será considerado funcional quando:

- Professores e alunos conseguirem realizar cadastro e login.
- Professores conseguirem criar e gerenciar turmas.
- Alunos conseguirem acessar suas respectivas turmas.
- Professores conseguirem criar e publicar atividades.
- Alunos conseguirem responder às atividades.
- O sistema corrigir as respostas e calcular as pontuações.
- Os resultados forem armazenados corretamente.
- Professores conseguirem visualizar relatórios individuais e coletivos.
- As permissões de acesso forem respeitadas.
- As principais telas funcionarem adequadamente em computadores e dispositivos móveis.

## 14. Como executar o projeto

Para executar o QuizFlow localmente, é necessário iniciar o PostgreSQL, o backend e o aplicativo mobile.

### Pré-requisitos

Antes de iniciar, instale:

- Node.js.
- npm.
- PostgreSQL.
- Expo Go (caso utilize um celular físico).
- VS Code ou outro editor de código.

O pgAdmin ou DBeaver podem ser utilizados para administrar o PostgreSQL, mas não precisam permanecer abertos durante a execução. O serviço do PostgreSQL precisa estar ativo.

### 1. Preparar o banco de dados

Inicie o serviço do PostgreSQL e confirme que o banco `quizflow` existe.

Configure a variável `DATABASE_URL` no arquivo `backend/.env`.

### 2. Instalar e iniciar o backend

Abra um terminal na pasta `backend`:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

Verifique a conexão acessando:

```text
http://localhost:3000/api/health
```

### 3. Instalar e iniciar o mobile

Abra outro terminal na pasta `mobile`:

```bash
npm install
npx expo start
```

Para limpar o cache:

```bash
npx expo start -c
```

Utilize o QR Code para abrir o aplicativo pelo Expo Go ou pressione `w` para testar no navegador, caso a configuração web esteja disponível.

### 4. Ordem de inicialização

Sempre que iniciar o ambiente local, siga esta ordem:

1. Inicie o serviço PostgreSQL.
2. Execute o backend com `npm run dev`.
3. Execute o aplicativo mobile com `npx expo start`.

O backend e o mobile devem permanecer em execução em terminais separados.

Para mais detalhes, consulte os documentos específicos:

- [Backend](backend/README.md)
- [Mobile](mobile/README.md)
