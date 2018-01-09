

# Rabix Composer
[![Build Status](https://travis-ci.org/rabix/composer.svg?branch=master)](https://travis-ci.org/rabix/composer)
[![Build status](https://ci.appveyor.com/api/projects/status/y4ksxv9uah0xmjy9?svg=true)](https://ci.appveyor.com/project/ivanbatic/composer)


The Rabix Composer (codename Cottontail) is a graphical and code editor specially designed to work with the [Common Workflow Language](https://github.com/common-workflow-language/common-workflow-language). It is currently in beta testing. This repo includes the code for running Rabix Composer locally in dev mode and for building OS specific binaries.

## Dependencies

- [Node.js](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/en/)

## Installation

```bash
git clone https://github.com/rabix/composer
cd composer
yarn install
```

**If you are using Linux:**

Install node.js from https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

Install yarn using Linux instructions provided on https://yarnpkg.com/lang/en/docs/install/

## Starting the dev environment
```bash
yarn run serve // starts the dev server
yarn run compile:electron // compiles electron backend
yarn run start:electron // opens the app shell
```

## Packaging the build as a desktop app for the host system and architecture
```bash
yarn run build
```

## Running the tests
```bash
yarn test
```

## Documentation

Now you can read the [Rabix Composer documentation](http://docs.rabix.io/) to learn more about Rabix Composer.
