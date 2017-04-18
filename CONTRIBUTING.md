# Contributing to Cottontail


## Reporting Issues

Questions, discussion points, bug reports and feature requests are welcome.

Bug reports should provide a clear and concise list of steps to reproduce. For issues related to the UI, include screenshots if applicable. You get bonus points if you submit a PR with a failing test along with the bug report.

Feature requests should provide a use case for the feature or a problem it would solve. We have a long backlog of features we would like to implement, feature requests will be prioritized according to our road-map and their value to the community.

## Submitting Pull Requests

There are [many](https://help.github.com/articles/creating-a-pull-request/) different [guides](https://yangsu.github.io/pull-request-tutorial/) for creating and submitting pull requests. In short: fork the cottontail repository, develop the feature or fix the bug on your fork following our [Coding Style Guide](https://github.com/rabix/cottontail-frontend/blob/master/doc/dev/coding-style-guide.md), adhere our commit message conventions, create a pull request to master. 

## Commit Message Conventions

Commit message conventions are largely inspired by the [Contributing to Angular Guide](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines). Changelogs are automatically generated from on commit messages, so formatting is important. A template for commit messages is located in `./.git-commit-template`.

Available `types` are enumerated in the link above. The `scope` should be the product whole that is affected by the code, roughly corresponding to the ng-module.

Examples of scopes include:

- workflow-editor
- tool-editor
- ui
- editor-common
- core
- layout
- util
- electron

> Scopes are subject to change as the application evolves and more features are added