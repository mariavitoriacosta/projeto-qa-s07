# Projeto S07 — Conduit com Docker e Jenkins

![RealWorld Example App](logo.png)

Projeto acadêmico da disciplina **S07 — Gerência de Configuração e Evolução de Software**, com aplicação de práticas de DevOps: containerização, integração contínua, testes automatizados, cobertura, empacotamento, armazenamento de artefatos e notificação por e-mail.

A aplicação é baseada no [Conduit RealWorld de TonyMckes](https://github.com/TonyMckes/conduit-realworld-example-app), construído com React, Vite, Express e Sequelize. A configuração atual deste repositório utiliza **MySQL**. Os créditos e a licença da base foram preservados.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias e arquitetura](#tecnologias-e-arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Obter o projeto](#obter-o-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Executar a aplicação com Docker](#executar-a-aplicação-com-docker)
- [Executar o ambiente completo com Jenkins](#executar-o-ambiente-completo-com-jenkins)
- [Configurar e executar a pipeline](#configurar-e-executar-a-pipeline)
- [Testes, relatórios e cobertura](#testes-relatórios-e-cobertura)
- [Notificação por e-mail](#notificação-por-e-mail)
- [Docker Hub e atualização da imagem Jenkins](#docker-hub-e-atualização-da-imagem-jenkins)
- [Desenvolvimento fora dos containers](#desenvolvimento-fora-dos-containers)
- [Build e execução pelo npm](#build-e-execução-pelo-npm)
- [Solução de problemas](#solução-de-problemas)
- [Organização dos arquivos](#organização-dos-arquivos)
- [Equipe e evidências](#equipe-e-evidências)
- [Uso de IA](#uso-de-ia)
- [Licença e referências](#licença-e-referências)

## Funcionalidades

O sistema segue a proposta [RealWorld](https://github.com/gothinkster/realworld) e oferece:

- Cadastro, login e autenticação com JWT.
- Criação, consulta, edição e exclusão de artigos.
- Artigos com conteúdo em Markdown e associação de tags.
- Favoritos, comentários e acompanhamento de outros usuários.
- Edição de perfil e biografia.
- Feed global, feed de autores seguidos, filtros e paginação.

Para começar, crie uma conta em **Sign up**, entre com suas credenciais e use **New Article** para publicar. O **Global Feed** lista os artigos disponíveis; o **Your Feed** depende dos autores que o usuário segue. Um banco recém-criado pode não conter artigos.

## Tecnologias e arquitetura

| Área | Tecnologias |
|---|---|
| Frontend | React 18, JavaScript, Vite, SWC, React Router, Axios |
| API | Node.js, Express, Sequelize, JWT e bcrypt |
| Banco da configuração atual | MySQL 8 |
| Testes | Vitest e Cypress |
| Relatório E2E | Cypress Mochawesome Reporter |
| Cobertura do frontend | Istanbul, `vite-plugin-istanbul`, `@cypress/code-coverage` e nyc |
| Automação | Jenkins, Jenkinsfile, Docker e Docker Compose |
| Notificação | Python 3, biblioteca padrão `smtplib` e TLS |

### Serviços do ambiente completo

| Serviço | Origem da imagem | Acesso | Persistência |
|---|---|---|---|
| `frontend` | Build local de `frontend/Dockerfile`, servido por Nginx | `localhost:3000` → porta 80 | Conteúdo estático incluído na imagem |
| `backend` | Build local de `backend/Dockerfile` | `localhost:3001` → porta 3001 | Dados armazenados no MySQL |
| `mysql` | Imagem `mysql:8.0` do Docker Hub | Rede interna, porta 3306 | Volume `mysql_data` |
| `jenkins` | Imagem publicada pelo grupo no Docker Hub | `127.0.0.1:8080` → porta 8080 | Volume `jenkins_home` |

Os arquivos `docker-compose.yml` e `compose.jenkins.yml`, utilizados na mesma chamada, formam o ambiente de **quatro containers**. O primeiro, sozinho, inicia apenas os três serviços da aplicação.

O frontend encaminha `/api/` para `backend:3001`, e o backend acessa o banco pelo nome `mysql`. Na pipeline, o Jenkins inicia um Vite instrumentado dentro de seu próprio container, e o Cypress acessa esse servidor em `127.0.0.1:3000`. Esse Vite encaminha as requisições à API em `http://backend:3001`.

O Cypress executa dentro do container Jenkins; não existe um serviço Cypress separado no Compose atual. A configuração combina Dockerfiles locais com imagens obtidas do Docker Hub.

## Pré-requisitos

### Execução com Docker

- [Git](https://git-scm.com/downloads).
- Docker Engine com Docker Compose v2 ou Docker Desktop com containers Linux.
- Portas 3000, 3001 e 8080 disponíveis.
- Acesso à internet para baixar imagens, dependências e acessar o SMTP.
- Editor de código, como VS Code, para preencher os arquivos de ambiente.

Node.js e Python não precisam estar instalados no computador para executar o ambiente completo com Docker; as ferramentas são disponibilizadas nos containers.

### Execução local e testes fora do Docker

- [Node.js **24**](https://nodejs.org/en/download/), para alinhar com o ambiente Jenkins, e [npm](https://www.npmjs.com/).
- O Cypress 16.1.0 do lockfile aceita Node 22, 24 ou versões a partir de 26; a indicação antiga de Node 18 não atende aos requisitos atuais dessa dependência.
- MySQL acessível e um banco de desenvolvimento existente.
- Python 3 apenas se o script de e-mail for executado diretamente na máquina.

O frontend e o backend possuem Dockerfiles baseados em Node 20; o Dockerfile do Jenkins usa Node 24 para a execução da suíte atual. A imagem final do frontend utiliza Nginx.

## Obter o projeto

Na pasta em que deseja manter o repositório:

```bash
git clone https://github.com/mariavitoriacosta/projeto-qa-s07.git
cd projeto-qa-s07
git switch main
git pull --ff-only origin main
```

Todos os comandos seguintes devem ser executados na **raiz do repositório**, salvo indicação diferente. Se o Git apontar alterações locais ao trocar de branch, preserve essas alterações antes de continuar.

Para instalar as dependências na máquina, utilize `npm ci`, que respeita o `package-lock.json`. O comando `npm install` também está disponível para o fluxo de manutenção de dependências, mas pode atualizar o lockfile. Essa instalação local não é necessária para apenas iniciar os containers.

## Variáveis de ambiente

O projeto utiliza três arquivos, com responsabilidades diferentes:

| Arquivo | Quando é utilizado |
|---|---|
| `.env` | Configuração do MySQL e JWT no Docker Compose da aplicação. |
| `infra/jenkins/.env` | Login do Jenkins, URL, SMTP e destinatários. |
| `backend/.env` | Backend executado diretamente por npm; não é necessário no fluxo Docker, que injeta as variáveis pelo Compose. |

Os `.env` reais não devem ser commitados. Os `.env.example` são modelos versionados. A configuração atual também exclui `.env` do contexto de build pelo `.dockerignore`.

### Aplicação: `.env`

Copie o modelo:

```bash
cp .env.example .env
```

No PowerShell, o equivalente é:

```powershell
Copy-Item .env.example .env
```

Preencha:

```dotenv
MYSQL_ROOT_PASSWORD=defina_uma_senha_root
MYSQL_PASSWORD=defina_uma_senha_para_qa_user
JWT_KEY=defina_uma_chave_secreta_para_jwt
```

| Variável | Finalidade |
|---|---|
| `MYSQL_ROOT_PASSWORD` | Senha do administrador MySQL. |
| `MYSQL_PASSWORD` | Senha do usuário `qa_user`, usada também pelo backend. |
| `JWT_KEY` | Chave usada para assinar e verificar tokens. |

O Compose cria o banco `database_development` na primeira inicialização de um volume vazio. O backend usa Sequelize para sincronizar as tabelas durante sua inicialização. Os seeders não são executados automaticamente.

Alterar as senhas no `.env` não modifica automaticamente usuários de um banco já persistido no volume. Nesse caso, ajuste as credenciais do banco existente ou restaure a configuração correspondente.

### Jenkins: `infra/jenkins/.env`

```bash
cp infra/jenkins/.env.example infra/jenkins/.env
```

Ou, no PowerShell:

```powershell
Copy-Item infra/jenkins/.env.example infra/jenkins/.env
```

| Variável | Finalidade / valor de referência |
|---|---|
| `JENKINS_ADMIN_USER` | Usuário de acesso; o modelo utiliza `admin`. |
| `JENKINS_ADMIN_PASSWORD` | Senha definida pelo responsável pelo ambiente. |
| `JENKINS_PORT` | Porta publicada na máquina; padrão `8080`. |
| `JENKINS_URL` | URL usada nos links; padrão `http://localhost:8080/`. |
| `CYPRESS_BASE_URL` | Valor geral do ambiente; modelo `http://frontend`. A pipeline o substitui durante os testes de cobertura. |
| `SMTP_HOST` | Servidor SMTP do provedor. |
| `SMTP_PORT` | Normalmente `587` para STARTTLS ou `465` para SSL, conforme o provedor. |
| `SMTP_SECURITY` | `starttls` ou `ssl`. |
| `SMTP_USER` | Usuário de autenticação SMTP. |
| `SMTP_PASSWORD` | Credencial aceita pelo provedor; pode exigir senha de aplicativo. |
| `EMAIL_FROM` | Endereço remetente autorizado no servidor SMTP. |
| `EMAIL_TO` | Um ou mais destinatários separados por vírgula. |

O script aceita SMTP sem autenticação quando **ambos** `SMTP_USER` e `SMTP_PASSWORD` estão vazios, desde que o servidor permita. Se um deles for preenchido, o outro também deve ser informado.

O `env_file` no serviço passa as variáveis ao container. Os argumentos `--env-file` dos comandos abaixo também fornecem os valores usados nas expressões `${...}` do Compose antes da criação dos containers. Por isso, mantenha os dois arquivos nos comandos do ambiente completo.

## Executar a aplicação com Docker

Este fluxo inicia **frontend, backend e MySQL**, sem Jenkins:

```bash
docker compose up -d --build
docker compose ps
```

Na primeira execução, o download das imagens e a instalação de dependências podem levar alguns minutos. O MySQL deve ficar `healthy`, e frontend/backend devem permanecer em execução. A ausência de um healthcheck no backend exige conferir seus logs e a resposta HTTP.

Acesse:

- Aplicação: <http://localhost:3000>.
- Resposta inicial da API: <http://localhost:3001>.
- Consulta de tags: <http://localhost:3001/api/tags>.
- Consulta de artigos: <http://localhost:3001/api/articles>.

[http://localhost:3001/api](http://localhost:3001/api) é o prefixo das rotas, não uma página de listagem obrigatória. Respostas como `{"tags":[]}` ou `{"articles":[],"articlesCount":0}` são válidas com banco vazio.

### Logs e parada da aplicação

```bash
docker compose logs --tail=100
docker compose logs --tail=100 backend
docker compose logs -f backend
```

Use `Ctrl+C` para sair do acompanhamento de logs; isso não para os containers iniciados com `-d`.

```bash
docker compose down
```

Esse comando remove os containers da aplicação e a rede quando possível, preservando os volumes. Para administrar o ambiente com Jenkins, utilize os comandos da seção seguinte.

## Executar o ambiente completo com Jenkins

Com os dois `.env` preenchidos, baixe as imagens externas:

```bash
docker compose --env-file .env --env-file infra/jenkins/.env -f docker-compose.yml -f compose.jenkins.yml pull jenkins mysql
```

Depois inicie os quatro serviços:

```bash
docker compose --env-file .env --env-file infra/jenkins/.env -f docker-compose.yml -f compose.jenkins.yml up -d --build
```

O comando constrói frontend e backend localmente e inicia o Jenkins pela imagem publicada pelo grupo. O serviço Jenkins atual não possui `build`; portanto, `--build` não reconstrói sua imagem.

Confira o ambiente:

```bash
docker compose --env-file .env --env-file infra/jenkins/.env -f docker-compose.yml -f compose.jenkins.yml ps
```

É esperado encontrar `frontend`, `backend`, `mysql` e `jenkins`. MySQL e Jenkins possuem healthchecks; o Jenkins pode levar alguns minutos para ficar pronto.

### Inicialização e persistência do Jenkins

- `infra/jenkins/Dockerfile` define as ferramentas, os plugins e os scripts da imagem.
- `infra/jenkins/plugins.txt` lista os plugins, incluindo Configuration as Code, Pipeline, Git, HTML Publisher, Timestamper e Stage View.
- `infra/jenkins/casc.yaml` configura autenticação, permissões, executor local e URL do Jenkins.
- `infra/jenkins/docker-entrypoint.sh` prepara as permissões do socket Docker quando presente e inicia o Jenkins como usuário `jenkins`.
- O volume `jenkins_home` preserva os jobs, histórico, artefatos, configurações e caches.
- O healthcheck consulta `/login`; ele não valida a aplicação nem o SMTP.

A montagem de `/var/run/docker.sock` permite controlar o Docker do ambiente hospedeiro. O Jenkinsfile atual não chama comandos Docker; a capacidade está disponível no ambiente. O acesso ao socket concede permissões amplas sobre esse daemon.

### Logs, alterações de ambiente e parada

```bash
docker compose --env-file .env --env-file infra/jenkins/.env -f docker-compose.yml -f compose.jenkins.yml logs --tail=100 jenkins
```

Depois de alterar `infra/jenkins/.env`, recrie o Jenkins para carregar os novos valores. Faça isso quando não houver build em andamento:

```bash
docker compose --env-file .env --env-file infra/jenkins/.env -f docker-compose.yml -f compose.jenkins.yml up -d --no-deps --force-recreate jenkins
```

Um simples `restart` não atualiza as variáveis armazenadas na configuração do container.

Para parar e remover o ambiente completo:

```bash
docker compose --env-file .env --env-file infra/jenkins/.env -f docker-compose.yml -f compose.jenkins.yml down
```

Os volumes continuam preservados. **A opção `down -v` remove os volumes desse projeto e pode apagar o banco, jobs, histórico e artefatos.**

## Configurar e executar a pipeline

### Vincular o job ao repositório

1. Acesse <http://localhost:8080> ou a porta configurada em `JENKINS_PORT`.
2. Entre com `JENKINS_ADMIN_USER` e `JENKINS_ADMIN_PASSWORD`.
3. Crie um **Novo item**, escolha um nome, por exemplo `pipeline`, e selecione **Pipeline**.
4. Na seção Pipeline, configure o checkout:

| Campo | Valor |
|---|---|
| Definition | `Pipeline script from SCM` |
| SCM | `Git` |
| Repository URL | `https://github.com/mariavitoriacosta/projeto-qa-s07.git` |
| Credentials | `- none -` para o repositório público |
| Branch Specifier | `*/main` |
| Script Path | `Jenkinsfile` |
| Lightweight checkout | Pode permanecer marcado |

5. Mantenha os gatilhos no padrão para a primeira execução manual e salve.
6. Clique em **Construir agora / Build Now**.
7. Abra o número da execução e consulte **Saída do console / Console Output**.

A interface é usada para vincular o job ao repositório. As etapas ficam no `Jenkinsfile` versionado, sem copiar sua implementação para o campo de script da interface. O JCasC atual configura o servidor Jenkins, mas não cria esse job automaticamente.

A branch aberta no VS Code não define a branch executada pelo Jenkins: o job utiliza a branch configurada no checkout e o conteúdo publicado no GitHub. Alterações locais precisam ser commitadas e enviadas para a branch correspondente antes de uma execução que deva utilizá-las.

### Etapas implementadas

| Etapa | Comportamento |
|---|---|
| Checkout | Limpa o workspace do job e baixa o código com `checkout scm`. |
| Instalar dependências | Executa `npm ci --no-audit --no-fund`. A primeira execução pode baixar também o Cypress. |
| Testes unitários e E2E | Executa Vitest, aguarda a API, inicia Vite instrumentado, executa Cypress e gera os relatórios de cobertura. |
| Validar cobertura mínima | Lê `coverage/coverage-summary.json` e exige pelo menos 90% em `total.lines.pct`. |
| Build e empacotamento | Gera `frontend/dist` e um pacote `artifacts/conduit-<BUILD_NUMBER>.tar.gz`. |
| Pós-execução: `post / always` | Tenta arquivar os arquivos disponíveis, publicar os relatórios HTML e enviar a notificação. |

O pacote inclui `backend`, `frontend/dist`, `package.json` e `package-lock.json`. Ele é um artefato de empacotamento; sua criação não publica automaticamente uma imagem no Docker Hub nem implanta a aplicação em um servidor.

O `disableConcurrentBuilds()` evita execuções simultâneas desse mesmo job. O servidor foi configurado com um executor local. A visualização das etapas depende de o plugin Stage View estar presente na imagem realmente utilizada.

### Resultado e tratamento de falhas

- Uma falha nos testes interrompe esse stage e normalmente pula os stages seguintes. Se o Vitest falhar, o comando de Cypress seguinte não chega a executar.
- Depois que o comando Cypress retorna, o shell tenta gerar o relatório de cobertura, inclusive quando houve falha nos testes E2E.
- A validação de cobertura usa `catchError`: uma falha marca a execução como `FAILURE`, mas permite tentar o build e empacotamento.
- O bloco `post / always` é executado ao final, inclusive após falhas nos stages, respeitando a disponibilidade do agente e os erros dos próprios passos de pós-execução.
- Se somente o envio de e-mail falhar em uma execução que estava `SUCCESS`, o código atual altera o resultado para `UNSTABLE`.
- A versão atual não configura novas tentativas automáticas dos testes. Uma falha intermitente deve ser investigada e preservada no relatório; 19 testes aprovados em 20 não equivalem a aprovação total nem a cobertura de código.

## Testes, relatórios e cobertura

### Testes unitários

Instale as dependências na raiz caso vá executar na máquina:

```bash
npm ci
npm test
```

Para executar uma única vez, sem permanecer em modo de observação:

```bash
npm test -- --run
```

Os arquivos unitários atuais incluem testes de helpers do backend e do frontend. A configuração está em `vitest.config.js`.

### Cypress E2E

Existem **20 cenários E2E**, identificados de TC-001 a TC-020, cobrindo cadastro, login, artigos, comentários, perfil, favoritos e tags, com casos positivos e negativos.

Com a aplicação disponível em `http://localhost:3000`:

```bash
npm run cy:run
```

Para abrir o modo interativo:

```bash
npm run cy:open
```

Esses comandos podem testar a aplicação iniciada pelo Docker. Não inicie outro frontend local na porta 3000 ao mesmo tempo. `npm run cy:open` exige uma sessão gráfica na máquina que o executa.

### Relatório de execução

O Cypress Mochawesome Reporter gera:

```text
cypress/reports/index.html
```

O relatório mostra os resultados dos cenários e as capturas de tela disponíveis nas falhas. Ao executar na máquina, abra o arquivo em um navegador. Ao executar no Jenkins, use **Relatório Cypress** ou os artefatos da execução.

**Relatório de aprovação dos testes e relatório de cobertura são medidas diferentes.** Todos os testes podem passar sem executar 90% das linhas do escopo medido.

### Cobertura de código

A pipeline mede o **frontend** instrumentado pelo Vite/Istanbul durante a execução do Cypress. A configuração nyc inclui `frontend/src/**/*.{js,jsx}` e exclui arquivos de testes, `setupTests.js` e `reportWebVitals.js`.

Os testes unitários são executados, mas o comando atual não gera nem combina sua cobertura com esse relatório. Não há medição de cobertura do backend nessa configuração.

| Arquivo / diretório | Conteúdo |
|---|---|
| `.nyc_output/` | Dados intermediários coletados durante os testes. |
| `coverage/coverage-summary.json` | Resumo numérico usado pela validação. |
| `coverage/lcov.info` | Dados em formato LCOV. |
| `coverage/lcov-report/index.html` | Relatório HTML publicado pelo Jenkins. |

A etapa de validação falha se o resumo estiver ausente, inválido, sem um percentual numérico de linhas ou com valor abaixo de 90%. O valor efetivo aparece no console, por exemplo: `Cobertura de linhas: 93.5% (mínimo: 90%).` Esse número é ilustrativo; consulte sua execução para obter a medição real.

Para reproduzir a coleta fora do Jenkins:

1. Mantenha o backend e seu MySQL disponíveis em `http://localhost:3001`.
2. Libere a porta 3000. Se o frontend Docker estiver ativo, pare apenas esse serviço com `docker compose stop frontend`.
3. Na raiz, instale as dependências com `npm ci` e remova dados antigos de `.nyc_output/` e `coverage/` se desejar uma medição nova.
4. Inicie um frontend instrumentado em um terminal PowerShell:

```powershell
$env:VITE_COVERAGE = "true"
npm run dev -w frontend
```

Em Bash/Git Bash, o equivalente é:

```bash
VITE_COVERAGE=true npm run dev -w frontend
```

5. Em outro terminal, execute os testes e gere o relatório:

```bash
npm run cy:run
npx nyc report --reporter=text --reporter=lcov --reporter=html --reporter=json-summary
```

Execute o segundo comando também se houver falha E2E, para inspecionar os dados coletados. Para conferir o limite localmente após gerar o relatório:

```bash
npx nyc check-coverage --lines 90
```

Essa checagem local não substitui a validação adicional de existência e formato implementada no Jenkinsfile. Ao terminar, encerre o Vite com `Ctrl+C`, remova `VITE_COVERAGE` do ambiente do terminal caso continue usando-o e reinicie o frontend Docker com `docker compose up -d frontend`, se necessário.

### Artefatos da pipeline

Na página de uma execução concluída, confira:

- `artifacts/conduit-<número>.tar.gz`.
- `cypress/reports/`, incluindo `index.html`.
- `coverage/`, incluindo o resumo JSON e o relatório HTML.

O Jenkinsfile usa `archiveArtifacts` com fingerprint, além de publicar os relatórios HTML. Os resultados persistem no volume `jenkins_home` conforme a retenção e o estado desse volume.

As opções `allowEmptyArchive` e `allowMissing` toleram arquivos ausentes em determinadas falhas. Portanto, verifique a listagem efetiva dos artefatos; o link no e-mail é montado pelo script e não comprova sozinho a existência de cada arquivo.

## Notificação por e-mail

O arquivo `scripts/send_email.py` utiliza apenas bibliotecas padrão do Python. Na imagem Jenkins ele é copiado para `/usr/local/bin/send_pipeline_email.py`, caminho chamado pelo Jenkinsfile.

A mensagem informa job, número, resultado, branch quando disponível, commit, duração, link da execução e link dos artefatos. O assunto segue o formato `[S07][RESULTADO] job #número`.

### Prévia sem envio

Com o ambiente completo ativo e as variáveis de remetente/destinatário preenchidas:

```bash
docker compose --env-file .env --env-file infra/jenkins/.env -f docker-compose.yml -f compose.jenkins.yml exec jenkins python3 /usr/local/bin/send_pipeline_email.py --dry-run --status TESTE
```

A prévia não conecta ao SMTP. Ela verifica a montagem da mensagem e exige `EMAIL_FROM` e `EMAIL_TO`.

### Teste de envio real

O comando seguinte envia uma mensagem aos destinatários configurados em `EMAIL_TO`:

```bash
docker compose --env-file .env --env-file infra/jenkins/.env -f docker-compose.yml -f compose.jenkins.yml exec jenkins python3 /usr/local/bin/send_pipeline_email.py --status TESTE
```

Fora de uma execução do job, os campos não fornecidos utilizam valores padrão, como `S07` e `local`. A mensagem `Mensagem aceita pelo servidor SMTP.` confirma a aceitação pelo servidor. Confira também a caixa de entrada e o spam para confirmar o recebimento.

| Código de saída | Significado |
|---|---|
| `0` | Envio aceito ou prévia concluída. |
| `1` | Falha de rede ou SMTP, incluindo autenticação e envio. |
| `2` | Configuração ausente ou inválida. |

Se aparecer `Branch: não informada`, a variável não chegou ao script; o envio pode continuar funcionando. Confirme o commit, que identifica a revisão executada. Depois de mudar o `.env`, recrie o container antes de repetir o teste.

## Docker Hub e atualização da imagem Jenkins

A imagem do grupo está publicada em:

<https://hub.docker.com/r/juliavicentini/projeto-qa-s07-jenkins>

O Compose atual utiliza `juliavicentini/projeto-qa-s07-jenkins:latest`. Para baixar uma versão atualizada:

```bash
docker pull juliavicentini/projeto-qa-s07-jenkins:latest
```

Em seguida, com nenhum build em andamento, recrie o serviço utilizando o comando apresentado na seção do ambiente completo. O volume preserva os dados; uma nova imagem não exige apagar o volume.

### Reconstruir e publicar

Alterações no Dockerfile, na lista de plugins ou no script de e-mail copiado para a imagem exigem uma nova construção/publicação. Esse fluxo é separado da pipeline atual e deve ser executado por quem tem permissão de publicação nesse repositório do Docker Hub:

```bash
docker build -f infra/jenkins/Dockerfile -t juliavicentini/projeto-qa-s07-jenkins:latest .
docker login
docker push juliavicentini/projeto-qa-s07-jenkins:latest
```

Se outro namespace for utilizado, ajuste a tag nos comandos e a referência em `compose.jenkins.yml`. Não inclua credenciais no README ou no comando de build. O arquivo `.env` fornece credenciais apenas na execução do container.

Como `latest` é uma tag mutável, registre a tag/digest efetivamente utilizado junto às evidências da entrega. A presença de um plugin no código-fonte não garante sua presença numa imagem publicada anteriormente.

## Desenvolvimento fora dos containers

Esse fluxo requer MySQL disponível na máquina ou em um endereço alcançável pelo backend. O serviço MySQL do Compose atual não publica a porta 3306 para o host; iniciá-lo sozinho não o torna automaticamente acessível ao Node executado na máquina.

1. Instale/configure o MySQL acessível e crie um banco de desenvolvimento.
2. Copie `backend/.env.example` para `backend/.env`.
3. Preencha as variáveis de desenvolvimento, por exemplo:

```dotenv
PORT=3001
JWT_KEY=defina_uma_chave_secreta
DEV_DB_USERNAME=seu_usuario_mysql
DEV_DB_PASSWORD=sua_senha_mysql
DEV_DB_NAME=database_development
DEV_DB_HOSTNAME=127.0.0.1
DEV_DB_DIALECT=mysql
DEV_DB_LOGGING=false
```

O nome lido pelo código para logging em desenvolvimento é **`DEV_DB_LOGGING`**. O arquivo de exemplo contém uma grafia antiga nesse campo; use o nome acima no arquivo local. O modelo também apresenta variáveis `TEST_DB_*` e `PROD_DB_*` para outros ambientes.

4. Na raiz, instale e inicie:

```bash
npm ci
npm run dev
```

O script inicia backend e Vite em conjunto. Acesse <http://localhost:3000>. A API utiliza <http://localhost:3001>, e o proxy Vite encaminha `/api` a esse endereço por padrão.

As portas não podem estar ocupadas pelos serviços equivalentes do Docker. Para executar Cypress em outro terminal, use `npm run cy:run` ou `npm run cy:open`.

Há migrations e seeders em `backend/`, além do script `npm run sqlz` para o Sequelize CLI. A inicialização atual da API utiliza `sequelize.sync({ alter: true })`; não é necessário executar migrations como etapa obrigatória adicional desse fluxo. Os seeders existentes não são executados automaticamente. Para uso interativo, prefira cadastrar uma conta pela aplicação: os usuários de exemplo dos seeders são inseridos diretamente e não devem ser considerados contas de login prontas.

## Build e execução pelo npm

Para gerar somente o frontend:

```bash
npm run build -w frontend
```

A saída é `frontend/dist`. Para visualizar o build pelo Vite:

```bash
npm run preview -w frontend
```

O preview não configura automaticamente o proxy `/api` do servidor de desenvolvimento; para testar a aplicação integrada, prefira o frontend servido pelo Nginx no Docker ou configure a API adequadamente.

O comando original de build seguido de inicialização do backend continua disponível:

```bash
npm run start
```

Ele executa o build do frontend e inicia o backend. Esse comando, sozinho, não define `NODE_ENV=production`, não fornece banco/credenciais e não faz deploy. Para o ramo de produção do backend, configure explicitamente o ambiente e as variáveis `PROD_DB_*` antes de iniciar. A execução integrada documentada neste projeto utiliza Docker Compose.

## Solução de problemas

| Sintoma | Como investigar / resolver |
|---|---|
| Arquivo `.env` não encontrado | Confirme a pasta atual e crie o arquivo a partir do modelo correspondente. |
| Erro pedindo `JENKINS_ADMIN_PASSWORD` | Preencha `infra/jenkins/.env` e passe esse arquivo com `--env-file` no comando completo. |
| Jenkins não abre imediatamente | Consulte `ps` e os logs; a inicialização pode levar alguns minutos. |
| Instalação de dependências demora | Consulte o console; o primeiro `npm ci` pode baixar o Cypress e compilar dependências. Erros de rede devem ser tratados a partir do log. |
| Site sem artigos, mas API retorna lista vazia com HTTP 200 | O banco pode estar vazio. Crie uma conta e publique um artigo; confira o Global Feed. |
| Console mostra `User not found` | Uma sessão antiga pode apontar para usuário ausente no banco atual. Saia da conta ou remova o login salvo e recarregue. |
| Frontend retorna 502 após recriação do backend | Confira primeiro a API em `localhost:3001`; se ela responde, tente `docker compose restart frontend` para restabelecer a resolução do upstream. |
| MySQL rejeita a senha após alteração do `.env` | O volume mantém os usuários anteriores. Corrija as credenciais do banco ou use os valores correspondentes, sem apagar dados por tentativa. |
| Jenkinsfile não aparece no VS Code | Confirme a branch local. Na versão documentada o arquivo está na raiz da `main`. |
| Jenkins não mostra a pipeline | Cadastre o job para checkout via SCM. Baixar o arquivo com Git não cria o job no Jenkins. |
| Etapas não aparecem graficamente | Confirme se a imagem Jenkins em execução contém `pipeline-stage-view` e se a execução chegou aos stages. |
| Cobertura não foi validada | Confira se o stage executou ou foi pulado após uma falha anterior. A porcentagem deve aparecer no console. |
| E-mail não chega | Consulte os logs do script, SMTP, destinatários e spam; recrie o container após alterar as variáveis. |
| Teste falha ocasionalmente | Preserve a execução, nome do cenário, log e screenshot para investigar sincronização, dados e respostas da API. |

Para remover somente a sessão antiga, digite no console do navegador da aplicação:

```javascript
localStorage.removeItem("loggedUser");
location.reload();
```

Essa ação remove o login salvo para aquela origem; não exclui contas nem artigos do banco.

## Organização dos arquivos

| Caminho | Responsabilidade |
|---|---|
| `backend/` | API, controllers, rotas, autenticação, modelos, migrations e seeders. |
| `backend/config/config.js` | Configuração dos bancos por ambiente. |
| `backend/Dockerfile` | Imagem local do backend. |
| `frontend/` | Interface React, componentes, rotas e serviços. |
| `frontend/vite.config.js` | Vite, proxy de desenvolvimento e instrumentação. |
| `frontend/Dockerfile` | Build do frontend e imagem final Nginx. |
| `frontend/nginx.conf` | Serviço de arquivos e proxy da API no container frontend. |
| `cypress/e2e/` | Cenários TC-001 a TC-020. |
| `cypress/pages/` | Objetos de página utilizados nos testes. |
| `cypress/support/` | Comandos e integração de cobertura/relatórios. |
| `cypress.config.js` | Configuração dos testes E2E. |
| `vitest.config.js` | Configuração dos testes unitários. |
| `infra/jenkins/Dockerfile` | Imagem personalizada do Jenkins. |
| `infra/jenkins/plugins.txt` | Plugins instalados por código. |
| `infra/jenkins/casc.yaml` | Configuração do Jenkins como código. |
| `infra/jenkins/docker-entrypoint.sh` | Inicialização e permissões do container. |
| `infra/jenkins/.env.example` | Modelo de ambiente Jenkins/SMTP. |
| `scripts/send_email.py` | Notificação por e-mail. |
| `docker-compose.yml` | Serviços frontend, backend e MySQL. |
| `compose.jenkins.yml` | Serviço Jenkins utilizando a imagem do grupo. |
| `Jenkinsfile` | Etapas e tratamento de resultados da pipeline. |
| `package.json` / `package-lock.json` | Workspaces, scripts, dependências e versões resolvidas. |
| `.env.example` / `.dockerignore` / `.gitignore` | Modelos e exclusões de configuração/build/versionamento. |
| `CODE_OF_CONDUCT.md` / `LICENSE` | Código de conduta e licença. |

Os diretórios `frontend/dist`, `artifacts`, `coverage`, `.nyc_output` e os relatórios Cypress são saídas geradas durante build/testes. Eles não substituem os arquivos-fonte versionados.

## Equipe e evidências

Contribuições identificadas no histórico do grupo:

| Integrante | Exemplos de contribuições DevOps |
|---|---|
| Maria Vitória da Costa | Ambiente Jenkins, Dockerfile, JCasC, Compose, script de e-mail e plugin de visualização. |
| Júlia Vicentini | Containerização da aplicação, documentação e integração de alterações; imagem Jenkins publicada em seu namespace. |
| Isabella Santos Fagundes | Jenkinsfile, integração da coleta/validação de cobertura e ajustes da API. |
| Marcela Ribeiro | Ajustes de integração dos testes com Jenkins e Compose consumindo a imagem publicada. |

Essa tabela descreve contribuições verificáveis e não restringe a responsabilidade de entendimento de cada integrante. Os commits e pull requests são a referência para autoria e evolução.

## Uso de IA

### Ferramentas e finalidade

Foi utilizado **ChatGPT, da OpenAI**, como apoio ao desenvolvimento e à revisão. A identificação exata da versão do modelo não foi registrada neste README;
O apoio documentado inclui:

- Elaboração e revisão de cenários positivos e negativos de testes.
- Esclarecimentos sobre Cypress, Vitest e configuração de relatórios.
- Apoio na criação e revisão de Dockerfiles, Compose, configurações Jenkins e script de e-mail.
- Investigação de erros de ambiente, autenticação, banco e comunicação entre containers.
- Explicação dos stages, da diferença entre cobertura e aprovação dos testes e do tratamento de falhas.
- Revisão dos requisitos de DevOps e organização desta documentação.

A IA forneceu sugestões e explicações. A execução no ambiente, a análise dos resultados e a decisão de aceitar uma alteração continuam sob responsabilidade dos integrantes.

### Exemplos reais de prompts e tratamento das respostas

Os exemplos abaixo foram extraídos da interação usada como apoio a esta etapa do projeto. A grafia foi mantida nos trechos citados.

| Prompt real | Como a resposta foi utilizada |
|---|---|
| “voce me ajudar a rodar esse projeto?” | Utilizada para orientar a execução e o diagnóstico. A orientação foi ajustada ao constatar que os containers já estavam ativos; os endpoints foram consultados para identificar o banco vazio. |
| “eu lembro q antes eu tinha colocado num projeto antigo pra mostrar as etapas quando ia rodando a pipeline, acho q esse aq nao tem isso, como coloco?” | A sugestão de adicionar `pipeline-stage-view` foi aceita e registrada no commit `4fd7f16`, mantendo a instalação por código. |
| “voce pode verificar se o meu projeto cumpre todos os requisitos do professor no pdf” | Utilizada como checklist de revisão do código, documentação, publicação da imagem e evidências de execução. O checklist não substitui a avaliação do professor. |
| “uma duvida, a pipeline tem umas estapas com muitos codigos, nao seria boa pratica separar esses codigos em arquivos menores? de algumas etapas” | A resposta sugeriu extrair blocos longos para scripts. A refatoração não foi aplicada na versão utilizada para esta documentação; os blocos continuam no Jenkinsfile. |

Uma orientação de colar a implementação da pipeline no campo de script da interface foi descartada após a leitura do enunciado. O fluxo documentado usa checkout por SCM e etapas no Jenkinsfile.

## Licença e referências

O projeto mantém a [licença MIT](LICENSE), o [código de conduta](CODE_OF_CONDUCT.md) e os créditos da aplicação-base.

Referências preservadas do README original:

- [Código original: Conduit RealWorld com React/Vite/Express](https://github.com/TonyMckes/conduit-realworld-example-app).
- [Demonstração da aplicação-base](https://conduit-realworld-example-app.fly.dev/) — referência externa, não é o ambiente do grupo e sua disponibilidade depende do mantenedor.
- [Variante da base com Create React App](https://github.com/TonyMckes/conduit-realworld-example-app/tree/create-react-app).
- [RealWorld](https://realworld.io/).
- [Especificação e comunidade RealWorld](https://github.com/gothinkster/realworld).
- [Outras implementações RealWorld / CodebaseShow](https://codebase.show/projects/realworld?category=fullstack).
- [Guia: How to write a Good README](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project).
- [CodebaseShow](https://codebase.show/).
- [Cypress Mochawesome Reporter](https://github.com/LironEr/cypress-mochawesome-reporter).

A descrição da aplicação e seus créditos de origem foram mantidos; os comandos e a arquitetura acima descrevem a configuração deste repositório acadêmico.
