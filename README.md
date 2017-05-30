

# Cottontail (Rabix Composer)
[![Build Status](https://travis-ci.org/rabix/cottontail-frontend.svg?branch=master)](https://travis-ci.org/rabix/cottontail-frontend)


The Rabix Composer (codename Cottontail) is a graphical and code editor specially designed to work with the [CommonWorkflowLanguage](https://github.com/common-workflow-language/common-workflow-language). It is currently in early development. This repo includes the code for running Cottontail locally in dev mode and for building OS specific binaries.

## Installation

```bash
git clone https://github.com/rabix/cottontail-frontend
cd cottontail-frontend
yarn install // linux users see instructions below for yarn install
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
