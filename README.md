

# Rabix Composer
[![Build Status](https://travis-ci.org/rabix/composer.svg?branch=master)](https://travis-ci.org/rabix/composer)


The Rabix Composer (codename Cottontail) is a graphical and code editor specially designed to work with the [CommonWorkflowLanguage](https://github.com/common-workflow-language/common-workflow-language). It is currently in early development. This repo includes the code for running Rabix Composer locally in dev mode and for building OS specific binaries.

## Installation

```bash
git clone https://github.com/rabix/composer
cd composer
npm install
```

**If you are using Linux:**

Install node.js from https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

## Starting the dev environment
```bash
npm run serve // starts the dev server
npm run compile:electron // compiles electron backend
npm run start:electron // opens the app shell
```

## Packaging the build as a desktop app for the host system and architecture
```bash
npm run build
```

## Running the tests
```bash
npm test
```

## Documentation

Now you can read the [Rabix Composer documentation](https://github.com/rabix/composer/wiki) to learn more about Rabix Composer.
