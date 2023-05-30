# Thesaurus - Projeto Manuel Correia de Andrade

## Requirements

- [Node.js](https://nodejs.org/en/download/) version v16.20.0
- [Yarn](https://yarnpkg.com/getting-started/install)

## Setup

1. Install the dependencies:

    ```bash
    # yarn
    yarn install
    ```
    
2. Create a `.env` file similar to `.env.example`.


3. Migrate the database:

    ```bash
    # yarn
    yarn prisma migrate dev
    ```


## Development Server

Start the development server on `http://localhost:3000`

```bash
yarn dev
```
