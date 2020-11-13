

# Rabix Composer
[![Build Status](https://travis-ci.org/rabix/composer.svg?branch=master)](https://travis-ci.org/rabix/composer)

Rabix Composer is an open source editor for [Common Workflow Language](https://github.com/common-workflow-language/common-workflow-language) 
documents. 

It has a graphical mode allowing drag and drop creation of workflows
and wizard type creation of individual tools.

![Workflows!](doc/images/workflows.gif)

It also has a text mode for entering CWL code directly. The graphical and text
modes work seamlessly together.

![Graphical to Text and back again!](doc/images/visual_text.gif)

## Dependencies

- [Node.js](https://nodejs.org/en/) (v12.x)

## Installation

```bash
git clone https://github.com/rabix/composer
cd composer
npm ci
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

Now you can read the [Rabix Composer documentation](http://docs.rabix.io/) to learn more about Rabix Composer.
