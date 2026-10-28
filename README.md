# ![RealWorld Example App](logo.png)

> **React / Vite + SWC / Express.js / Sequelize codebase containing real world examples (CRUD, auth, advanced patterns, etc.) that adheres to the [RealWorld](https://realworld.io/) spec and API.**

This codebase was created to demonstrate a fully fledged fullstack application built with **React / Vite + SWC / Express.js / Sequelize** including CRUD operations, authentication, routing, pagination, and more.

**[Demo app](https://conduit-realworld-example-app.fly.dev/)&nbsp;&nbsp;|&nbsp;&nbsp;[With Create React App](https://github.com/TonyMckes/conduit-realworld-example-app/tree/create-react-app)&nbsp;&nbsp;|&nbsp;&nbsp;[Other RealWorld Example Apps](https://codebase.show/projects/realworld?category=fullstack)**

> For more information on how this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

---

## Getting Started

These instructions will help you install and run the project on your local machine for development and testing.

### Prerequisites

Before you run the project, make sure that you have the following tools and software installed on your computer:

- Text editor/IDE (e.g., VS Code, Sublime Text, Atom)
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/) `v18.11.0+`
- [NPM](https://www.npmjs.com/) (usually included with Node.js)
- Docker
- Docker Compose

### Installation

To install the project on your computer, follow these steps:

1. Clone the repository to your local machine.

```bash id="w6eb0m"
git clone <URL_DO_REPOSITORIO>
```

2. Navigate to the project directory.

```bash id="tsj42k"
cd projeto-qa-s07
```

3. Install project dependencies if you intend to run the application without Docker:

```bash id="jgbq76"
npm install
```

### Configuration

The application uses environment variables for database credentials and JWT authentication.

Create a `.env` file in the root directory using `.env.example` as a reference:

```bash id="72c5rn"
cp .env.example .env
```

On Windows, you can also manually copy `.env.example` and rename the copy to `.env`.

Configure the following variables:

```env id="6aqrmm"
MYSQL_ROOT_PASSWORD=sua_senha_root
MYSQL_PASSWORD=sua_senha_mysql
JWT_KEY=sua_chave_jwt
```

- `MYSQL_ROOT_PASSWORD`: password for the MySQL administrator user.
- `MYSQL_PASSWORD`: password used by the database user that allows the backend to connect to MySQL.
- `JWT_KEY`: secret key used by the backend to generate and validate authentication tokens.

> **Important:** the `.env` file contains sensitive information and must not be committed to the repository. Each developer should create their own local `.env` file. The `.env.example` file is versioned only as a reference for the required variables.

---

## Usage

### Running with Docker

The recommended way to run the current application environment is through Docker Compose.

Currently, the environment consists of three services:

- **Frontend:** React application served by Nginx.
- **Backend:** Node.js/Express API.
- **MySQL:** database used by the backend.

#### Starting the application

With Docker running, execute the following command from the root directory:

```bash id="4l3fbs"
docker compose up -d --build
```

Docker Compose will:

- Build the backend image using `backend/Dockerfile`.
- Build the frontend image using `frontend/Dockerfile`.
- Start the MySQL container using the `mysql:8.0` image.
- Create the network used for communication between the services.
- Create/use the volume responsible for MySQL data persistence.

The services will be available at:

| Service | Description | Access |
| --- | --- | --- |
| `frontend` | React + Nginx | `http://localhost:3000` |
| `backend` | Node.js + Express | `http://localhost:3001` |
| `mysql` | MySQL database | Internal Docker network |

The backend communicates with the database using the `mysql` service name inside the Docker Compose network.

#### Checking the containers

To check the status of the services:

```bash id="b5mt4c"
docker compose ps
```

The MySQL service should appear as `healthy`, while the frontend and backend services should appear as `Up`.

The application can then be accessed at:

```text id="bmg2ha"
http://localhost:3000
```

The backend/API can be accessed at:

```text id="1vb5d7"
http://localhost:3001
```

API endpoints are available under:

```text id="f9rw31"
http://localhost:3001/api
```

#### Viewing logs

To view logs from all services:

```bash id="q9drak"
docker compose logs
```

To view only backend logs:

```bash id="50i4ca"
docker compose logs backend
```

To follow backend logs in real time:

```bash id="7bh4md"
docker compose logs -f backend
```

#### Stopping the application

To stop and remove the containers:

```bash id="gsl3yd"
docker compose down
```

MySQL data is stored in a Docker volume and remains available after the containers are removed.

> **Warning:** avoid using `docker compose down -v` if you want to preserve database data, since the `-v` option also removes the volumes.


---

### Development Server

To run the project locally without Docker, install the dependencies and execute:

```bash id="gv56n7"
npm install
npm run dev
```

Open a web browser and navigate to:

- Home page: [`http://localhost:3000/`](http://localhost:3000)
- API endpoints: [`http://localhost:3001/api`](http://localhost:3001/api)

---

### Running Tests

To run tests, simply run the following command:

```bash id="w5x9om"
npm run test
```

### Cypress E2E Tests

Configure the backend database, run the application in one terminal, and run Cypress in another:

```bash id="ppd0ji"
npm install
npm run dev
```

Then:

```bash id="z97qnt"
npm run cy:run
```

To inspect the scenarios interactively, use:

```bash id="hch31u"
npm run cy:open
```

`npm run cy:run` also generates an HTML execution report via [cypress-mochawesome-reporter](https://github.com/LironEr/cypress-mochawesome-reporter) at:

```text id="ecxxk8"
cypress/reports/index.html
```

The report contains the pass/fail status of the test cases and screenshots of failures. Open the generated file in a browser after the test execution finishes to inspect the complete report.

> The Cypress execution report represents the result of the E2E test execution and should not be confused with the project's code coverage report.

---

### Production

The following command will build the production version of the app:

```bash id="4r70sw"
npm run start
```

---

## Organização

```text id="tj0mxh"
projeto-qa-s07/
│
├── backend/                  # API, regras de negócio e acesso ao banco
│   ├── config/               # Configurações do Sequelize
│   └── Dockerfile            # Imagem Docker do backend
│
├── frontend/                 # Interface React
│   ├── Dockerfile            # Imagem Docker do frontend
│   └── nginx.conf            # Configuração do Nginx
│
├── cypress/                  # Testes E2E
│
├── docker-compose.yml        # Orquestração dos containers
├── cypress.config.js         # Configuração do Cypress
├── vitest.config.js          # Configuração do Vitest
├── package.json              # Scripts e dependências do projeto
├── package-lock.json
├── .dockerignore             # Arquivos ignorados durante o build Docker
├── .env.example              # Exemplo das variáveis de ambiente necessárias
├── .gitignore
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md
```

---

## Uso de Inteligência Artificial

Durante o desenvolvimento da suíte de testes e da infraestrutura do projeto, foi utilizada Inteligência Artificial como ferramenta de apoio.

A IA foi utilizada principalmente para auxiliar em atividades como:

- elaboração e revisão de cenários de teste;
- sugestões de casos positivos e negativos;
- estruturação de testes automatizados;
- esclarecimento sobre utilização do Cypress e Vitest;
- análise e investigação de erros encontrados durante a implementação;
- configuração e revisão dos Dockerfiles;
- configuração da comunicação entre frontend, backend e banco de dados utilizando Docker Compose;
- investigação de problemas de conexão e autenticação com o banco de dados;
- sugestões de melhoria e organização dos testes e da infraestrutura.

A utilização da IA teve caráter auxiliar, sendo necessária a análise, adaptação, execução e validação das sugestões no contexto real da aplicação.

Dessa forma, as alterações foram revisadas e executadas para verificar se o comportamento implementado correspondia ao funcionamento esperado do sistema.


---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [RealWorld](https://realworld.io/)
- [RealWorld (GitHub)](https://github.com/gothinkster/realworld)
- [CodebaseShow](https://codebase.show/)
- [How to write a Good README](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)
