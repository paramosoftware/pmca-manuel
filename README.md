# Glossário de conservação-restauro de livros e documentos em papel do Projeto Manuel Correia de Andrade (PMCA)

## About

This is a glossary of conservation-restoration terms for books and paper documents, developed for the [Manuel Correia de Andrade Project](https://sites.usp.br/pmca/). It is a multi-platform application, developed with [Nuxt.js](https://nuxtjs.org/) and [Electron](https://www.electronjs.org/). On the server side, it uses [Express](https://expressjs.com/) and [Prisma](https://www.prisma.io/).

## Requirements

- [Node.js](https://nodejs.org/en/download/), see [.nvmrc](.nvmrc) for the recommended version.
- [PNPM](https://pnpm.io/), see `packageManager` in [package.json](package.json) for the recommended version.


## Installation

### With setup script

1. Clone the repository.
2. Run the setup script to install dependencies.
   
    ```bash
     chmod +x ./scripts/install.sh && ./scripts/install.sh
    ```
3. Run the generate-env script to create the .env file.
   
    ```bash
    node ./scripts/generate-env.js
    ```

4. Run the scaffold command to create the database with minimal data.
   
    ```bash
    pnpm scaffold
    ```

### Without setup script

1. Create a `.env` file in the root directory based on the `.env.example` file.
2. Run scaffold script to install dependencies and create the database with minimal data.
   
    ```bash
    pnpm setup
    ```

3. Start the development server.
    ```bash
    pnpm dev
    ```

The application will be available at http://localhost:3000. The default login is `admin` and the password is `admin`.


## Build for production

### Web

By default, the application uses pm2 to manage the server process. 

1. Create a `.env` file in the root directory based on the `.env.example` file.
2. Run the following command to build the application for production:

    ```bash
    pnpm web:prod
    ```

3. Start the server process with pm2:

    ```bash
    pm2 start ecosystem.config.js
    ```

4. Configure reverse proxy to redirect requests to the application.

### Electron

To build the Electron application, run the following command:

```bash
pnpm electron:build
```