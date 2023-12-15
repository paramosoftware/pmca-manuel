# Glossário de conservação-restauro de livros e documentos em papel do Projeto Manuel Correia de Andrade (PMCA)

## About

This is a glossary of conservation-restoration terms for books and paper documents, developed for the [Manuel Correia de Andrade Project](https://sites.usp.br/pmca/). It is a multi-platform application, developed with [Nuxt.js](https://nuxtjs.org/) and [Electron](https://www.electronjs.org/). On the server side, it uses [Express](https://expressjs.com/) and [Prisma](https://www.prisma.io/).

## Requirements

- [Node.js](https://nodejs.org/en/download/) version 20.10.0 (current tested version)
- [PNPM](https://pnpm.io/) version 8.12 (current tested version)

## Setup

1. Create a `.env` file in the root directory based on the `.env.example` file.
2. Run scaffold script to install dependencies and create the database with minimal data.
   
    ```bash
    pnpm scaffold
    ```

3. Start the development server.
    ```bash
    pnpm dev
    ```

The application will be available at http://localhost:3000. The default login is `admin` and the password is `admin`.


## Build for production

### Web

To build the web application, run the following command:

```bash
pnpm build
```
To run the production build locally, all .env variables must be set in the environment. To do this, you can use the [dotenv](https://www.npmjs.com/package/dotenv) package. For example:

```bash
node -r dotenv/config .output/server/index.mjs
```

### Electron

To build the Electron application, set the BUILD_TARGET environment variable in the .env file to your target platform (WINDOWS, LINUX (default) or MAC). Then run the following command:

```bash
pnpm build:electron
```