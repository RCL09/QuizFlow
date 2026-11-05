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