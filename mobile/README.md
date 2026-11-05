# QuizFlow — Mobile

Aplicativo mobile da plataforma QuizFlow, desenvolvido com React Native e Expo.

## 1. Sobre o aplicativo

O mobile do QuizFlow tem como objetivo oferecer uma experiência simples, intuitiva e acessível para a realização de atividades educacionais gamificadas.

Por meio da aplicação, os alunos poderão acessar suas turmas, visualizar atividades disponíveis, responder perguntas por meio de minijogos e acompanhar seus resultados.

Os professores também poderão acessar as funcionalidades de gerenciamento disponibilizadas pela plataforma, de acordo com seu perfil e suas permissões.

## 2. Funcionalidades

A aplicação está sendo desenvolvida de forma incremental.

### Funcionalidades da estrutura inicial

- Tela de login.
- Tela de cadastro.
- Seleção de perfil entre aluno e professor.
- Validação dos dados dos formulários.
- Integração com a API de autenticação.
- Identificação dos usuários conforme o perfil.
- Comunicação com o backend.

### Funcionalidades previstas para os alunos

- Página inicial com as turmas vinculadas.
- Visualização das atividades disponíveis.
- Acesso aos minijogos educacionais.
- Resolução e envio das respostas.
- Visualização dos resultados e pontuações.
- Histórico de atividades concluídas.

### Funcionalidades previstas para os professores

- Acesso ao ambiente do professor.
- Visualização e gerenciamento das turmas.
- Criação e edição de atividades.
- Publicação de atividades.
- Acompanhamento do desempenho dos alunos.
- Consulta aos relatórios individuais e coletivos.

## 3. Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| React Native | Desenvolvimento da interface mobile |
| Expo | Execução e gerenciamento do aplicativo |
| TypeScript | Tipagem e organização do código |
| Expo Router | Navegação entre telas |
| Fetch API | Comunicação com o backend |

## 4. Estrutura de pastas

```text
mobile/
│
├── assets/
│
├── src/
│   └── app/
│       ├── _layout.tsx
│       └── index.tsx
│
├── .env
├── .env.example
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Principais arquivos

- `src/app/index.tsx`: tela principal do aplicativo.
- `src/app/_layout.tsx`: configuração da navegação utilizando Expo Router.
- `assets/`: imagens, ícones e outros recursos visuais.
- `app.json`: configurações do projeto Expo.
- `package.json`: dependências e comandos disponíveis.

## 5. Requisitos para execução

Para executar o aplicativo, é necessário ter:

- Node.js instalado.
- npm.
- Projeto configurado com Expo.
- Backend do QuizFlow em execução.
- PostgreSQL ativo e acessível pelo backend.
- Expo Go instalado no celular, caso queira testar em um dispositivo físico.

O backend e o PostgreSQL precisam estar funcionando para que as operações reais de cadastro e login sejam realizadas.

## 6. Instalação do projeto

Após clonar o repositório ou receber os arquivos do projeto, abra um terminal dentro da pasta `mobile`.

Instale as dependências:

```bash
npm install
```

Esse comando instala os pacotes necessários para executar o aplicativo.

## 7. Configuração da comunicação com a API

O aplicativo utiliza uma variável de ambiente para definir o endereço do backend.

Na pasta `mobile`, crie um arquivo chamado `.env`.

Configure:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

O endereço precisa corresponder ao ambiente em que o aplicativo será executado.

### 7.1. Teste pelo navegador no computador

Caso o frontend seja executado no navegador da mesma máquina onde o backend está funcionando:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 7.2. Teste pelo Expo Go no celular

Quando o aplicativo for executado em um celular físico, `localhost` não deverá ser utilizado, pois ele representa o próprio celular.

Nesse caso:

1. Conecte o computador e o celular à mesma rede Wi-Fi.
2. Abra o PowerShell no computador.
3. Execute:

```powershell
ipconfig
```

4. Localize o endereço IPv4 do adaptador de rede utilizado.

Exemplo:

```text
IPv4: 192.168.1.10
```

Configure o `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

Substitua o endereço de exemplo pelo IPv4 real do computador.

O firewall também precisa permitir a comunicação com a porta utilizada pelo backend.

### 7.3. Teste no emulador Android

Quando o backend estiver rodando no computador e o aplicativo estiver sendo executado no emulador Android padrão, utilize:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

Esse endereço permite que o emulador Android acesse o computador que está executando o servidor.

**Importante:** sempre que alterar o arquivo `.env`, será necessário reiniciar o Expo para carregar as novas configurações.

## 8. Como iniciar o projeto completo

O funcionamento do QuizFlow depende da comunicação entre o aplicativo, a API e o banco de dados.

Por isso, a inicialização deve seguir uma ordem.

### 8.1. Iniciar o PostgreSQL

Primeiro, inicie o serviço do PostgreSQL.

No Windows:

1. Pressione `Win + R`.
2. Digite `services.msc`.
3. Localize o serviço PostgreSQL.
4. Verifique se ele está em execução.

O pgAdmin ou DBeaver não precisam ficar abertos. Eles são apenas ferramentas de administração do banco.

### 8.2. Iniciar o backend

Abra o terminal do VS Code na pasta `backend`.

Execute:

```bash
npm run dev
```

O terminal deverá apresentar:

```text
QuizFlow API rodando em http://localhost:3000
Verificação: http://localhost:3000/api/health
```

Para confirmar que a API está funcionando, acesse:

```text
http://localhost:3000/api/health
```

Resposta esperada:

```json
{
  "api": "online",
  "database": "connected"
}
```

Mantenha esse terminal aberto enquanto utilizar o aplicativo.

### 8.3. Iniciar o Mobile

Abra um segundo terminal no VS Code, agora na pasta `mobile`.

Execute:

```bash
npx expo start
```

O Expo iniciará o ambiente de desenvolvimento e apresentará um QR Code no terminal.

Para limpar o cache antes da inicialização, utilize:

```bash
npx expo start -c
```

### 8.4. Executar no celular

1. Instale o Expo Go no dispositivo.
2. Conecte o celular à mesma rede Wi-Fi do computador.
3. Escaneie o QR Code apresentado pelo Expo.
4. Aguarde o aplicativo carregar.

### 8.5. Executar no navegador

Caso o projeto esteja configurado para execução web, pressione:

```text
w
```

no terminal do Expo.

O projeto será aberto no navegador, permitindo testar a interface no computador.

## 9. Fluxo de autenticação

A autenticação permite que os usuários acessem o QuizFlow conforme seu perfil.

### Cadastro de aluno

O aluno deverá informar:

- Nome completo.
- E-mail.
- Senha.
- Confirmação da senha.
- Aceite dos termos de uso.

Não é necessário informar um código de turma durante o cadastro.

O vínculo com as turmas será realizado posteriormente, dentro da plataforma.

### Cadastro de professor

O professor deverá informar:

- Nome completo.
- E-mail.
- Senha.
- Confirmação da senha.
- Escola ou instituição de ensino.
- Aceite dos termos de uso.

### Login

O usuário informa:

- E-mail.
- Senha.
- Perfil de acesso.

O aplicativo encaminha as informações para o endpoint de autenticação do backend.

O backend valida as credenciais e retorna um token JWT quando a autenticação é bem-sucedida.

## 10. Comunicação com o backend

O aplicativo realiza requisições HTTP para a API do QuizFlow.

As principais rotas utilizadas na autenticação são:

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/health` | Verificar disponibilidade da API |
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Autenticar usuário |

A URL base dessas requisições é definida pela variável:

```env
EXPO_PUBLIC_API_URL
```

O aplicativo não deve acessar o PostgreSQL diretamente. Todas as operações com o banco de dados devem passar pelo backend.

## 11. Identidade visual

A interface do QuizFlow segue uma identidade visual moderna, amigável e intuitiva.

Diretrizes:

- Azul como cor principal.
- Branco para fundos e áreas de conteúdo.
- Verde para indicadores positivos.
- Cartões para organizar informações.
- Botões com identificação clara das ações.
- Tipografia sem serifa e de fácil leitura.
- Componentes adaptados para diferentes tamanhos de tela.

A interface deverá priorizar a simplicidade de navegação e a facilidade de utilização pelos alunos.

## 12. Próximas funcionalidades

As próximas etapas do desenvolvimento mobile incluem:

1. Página inicial do aluno.
2. Listagem das turmas vinculadas.
3. Funcionalidade para entrar em uma turma.
4. Página de atividades disponíveis.
5. Interface para execução dos minijogos.
6. Tela de resultado da atividade.
7. Histórico de atividades.
8. Painel do professor.
9. Interfaces de criação e gerenciamento de atividades.
10. Visualização dos relatórios de desempenho.

## 13. Problemas comuns

### Erro de conexão com o backend

Confira:

- Se o servidor Node.js está iniciado.
- Se a variável `EXPO_PUBLIC_API_URL` está correta.
- Se o computador e o celular estão na mesma rede, quando utilizar Expo Go.
- Se o firewall permite a comunicação.
- Se a rota `/api/health` está respondendo.

### Alterações no `.env` não são reconhecidas

Encerre o Expo e reinicie:

```bash
npx expo start -c
```

### Cadastro informa que o e-mail já existe

O backend não permite dois usuários com o mesmo e-mail. Utilize outro endereço ou entre com a conta já cadastrada.

### Perfil não corresponde à conta

No login, selecione o mesmo perfil utilizado no cadastro: aluno ou professor.

### Erro durante a instalação

Tente limpar o cache do npm:

```bash
npm cache clean --force
```

Depois, execute novamente:

```bash
npm install
```

Verifique também se existe espaço livre no disco.

---

**QuizFlow — Aplicativo Mobile**