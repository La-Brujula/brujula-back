# La Brújula back-end

The back-end portion of our infrastructure. An node.js server based on [Express](https://expressjs.com) & [Sequelize](https://sequelize.org) that connects to [PostgreSQL](https://www.postgresql.org).

## To run locally

```sh
git clone https://github.com/La-Brujula/brujua-back.git
```

## First time procedure

When you first clone the repo you need to install the required dependencies. To do so, run the following command:

```sh
yarn
```

## Development Server

To run the development server, use the following command:

```sh
yarn dev
```

## Possible Issues

### yarn not installed

If when running any of the above commands you see the following output:

```sh
'yarn' is not recognized as an internal or external command, operable program or batch file
```

run:

```sh
npm install -g yarn

yarn --version
```

\* We use yarn because it is morally superior to npm.
