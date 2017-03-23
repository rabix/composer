

# Cottontail (Rabix Editor)
[![Build Status](https://travis-ci.org/rabix/cottontail-frontend.svg?branch=master)](https://travis-ci.org/rabix/cottontail-frontend)


The Rabix Editor (codename Cottontail) is a graphical and code editor specially designed to work with the [CommonWorkflowLanguage](https://github.com/common-workflow-language/common-workflow-language). It is currently in early development. This repo includes the code for running Cottontail locally in dev mode and for building OS specific binaries.

## Installation

```bash
git clone https://github.com/rabix/cottontail-frontend
cd cottontail-frontend
npm install
```

## Starting the dev environment
```bash
npm run serve // starts the dev server
npm run electron:compile // compiles electron backend
npm run electron // opens the app shell
```

## Packaging the build as a desktop app for the host system and architecture
```bash
npm run build
npm run electron:compile
npm run package
```

## Setup

### Adding local folders

Local directories can be added to the cottontail workspace by clicking the plus icon next to Local Files, which will open the native file picker.

![Adding Local Folders](http://i.imgur.com/jNAnyQe.png)

To remove a folder, right click on it and use the context menu. SevenBridges projects are added the same way once your account is connected.

![Removing Local Folders](http://i.imgur.com/I7dHDad.png)

`.yaml`, `.json`, `.yml`, and `.cwl` will be treated as potential CWL files. If they contain the key `class` which is either `CommandLineTool` or `Workflow`, the file will be validated against the [appropriate JSON schema](https://github.com/rabix/cwl-ts). If the tool or workflow doesn't have a specified `cwlVersion`, validation defaults to draft-2.

### Connecting with SevenBridges

Cottontail can connect to your SevenBridges account, so you can edit your SB apps locally. In order to connect, open the settings page (by clicking the top right button) and enter your authentication token. Find out how to generate your token [here](http://docs.sevenbridges.com/v1.0/docs/get-your-authentication-token). 

![](http://i.imgur.com/zda5ANH.png)
> If you are already logged in to SevenBridges, the "Seven Bridges Platform" link will take you directly to the developer page where your token lives.
