# Manuel - Ferramenta de glossário

## About

O Manuel é um software livre multiplataforma para a gestão e divulgação de vocabulários, desenvolvido como uma das atividades do [Projeto Manuel Correia de Andrade](https://sites.usp.br/pmca/). Foi desenvolvido com [Nuxt.js](https://nuxtjs.org/) e [Electron](https://www.electronjs.org/). No lado do servidor, utiliza [Express](https://expressjs.com/) e [Prisma](https://www.prisma.io/).

Manuel is a free and open-source multiplatform software for the management and dissemination of vocabularies, developed as one of the activities of the [Manuel Correia de Andrade Project](https://sites.usp.br/pmca/). It was developed with [Nuxt.js](https://nuxtjs.org/) and [Electron](https://www.electronjs.org/). On the server side, it uses [Express](https://expressjs.com/) and [Prisma](https://www.prisma.io/).

## Requirements

- [Node.js](https://nodejs.org/en/download/), see [.nvmrc](.nvmrc) for the recommended version.
- [PNPM](https://pnpm.io/), see `packageManager` in [package.json](package.json) for the recommended version.

## Installation

1. Clone the repository.

```bash
git clone https://github.com/paramosoftware/pmca-manuel
cd pmca-manuel
```

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
pnpm web:prod
```

### Electron

To build the Electron application, run the following command:

```bash
pnpm electron:build
```