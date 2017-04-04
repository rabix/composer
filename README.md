

# Cottontail (Rabix Composer)
[![Build Status](https://travis-ci.org/rabix/cottontail-frontend.svg?branch=master)](https://travis-ci.org/rabix/cottontail-frontend)


The Rabix Composer (codename Cottontail) is a graphical and code editor specially designed to work with the [CommonWorkflowLanguage](https://github.com/common-workflow-language/common-workflow-language). It is currently in early development. This repo includes the code for running Cottontail locally in dev mode and for building OS specific binaries.

## Installation

```bash
git clone https://github.com/rabix/cottontail-frontend
cd cottontail-frontend
yarn install
```

## Starting the dev environment
```bash
yarn run serve // starts the dev server
yarn run electron:compile // compiles electron backend
yarn run electron // opens the app shell
```

## Packaging the build as a desktop app for the host system and architecture
```bash
yarn run build
yarn run electron:compile
yarn run package
```