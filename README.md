

# Rabix Composer
[![Tests](https://github.com/rabix/composer/workflows/Tests/badge.svg)](https://github.com/rabix/composer/actions?query=workflow%3ATests)
[![Tests](https://github.com/rabix/composer/workflows/Release/badge.svg)](https://github.com/rabix/composer/actions?query=workflow%3ARelease)


Rabix Composer is an open source visual editor for [Common Workflow
Language](https://github.com/common-workflow-language/common-workflow-language)
documents.

It has a graphical mode allowing drag and drop creation of workflows
and a wizard for creation of individual tools.

![Workflows!](doc/images/workflows.gif)

It also has a text mode for entering CWL code directly. The graphical and text
modes work seamlessly together.

![Graphical to Text and back again!](doc/images/visual_text.gif)

## Dependencies

- [Node.js](https://nodejs.org/en/)

## Installation

```bash
git clone https://github.com/rabix/composer
cd composer
npm install
```

**If you are using Linux:**

Install node.js from https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

Install yarn using Linux instructions provided on https://yarnpkg.com/lang/en/docs/install/

## Starting the dev environment
```bash
npm run compile:electron // compiles electron backend
npm run compile:angular
```

In one terminal start the server
```bash
npm run serve // starts the dev server
```

In another terminal start the application
```bash
yarn run start:electron // opens the app shell
```

## Packaging the build as a desktop app for the host system and architecture
```bash
npm run build
```


## Running the tests
```bash
npm run test
```

## Documentation

Now you can read the [Rabix Composer documentation](http://docs.rabix.io/) to learn more about Rabix Composer.
