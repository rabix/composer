# Notice to Contributors to Seven Bridges Open Source Projects

We require contributors to our open-source projects to sign a Seven
Bridges Contributor Agreement (SBCA). The SBCA doesn’t require you to
lose rights to your work, but only to share the copyright with Seven
Bridges jointly, and when applicable to grant Seven Bridges and other
collaborators and users of the project a patent license.

This is a common arrangement in larger open source projects, and
provides several benefits to both the project and its contributors. The
SBCA allows Seven Bridges to defend the project from hostile
intellectual property litigation--for example, if a contributor or their
employer attempted to assert control of the project, or rescind their
contribution. Seven Bridges could not do this without the consolidated
ownership of the copyright that the SBCA provides. Since the Agreement
establishes joint ownership of copyright, you and any other contributor
will have the right to whatever you want to with your contribution,
including contribute it to other open source projects or distribute it
under proprietary licenses. If we distribute your contribution in any
way, the SBCA obliges us to also make it available under an open source
license approved by the Free Software Foundation (FSF) or Open Source
Initiative (OSI).

If you’re contributing on behalf of your employer, make sure that anyone
signing the agreement is authorized to do so by your employer.

## Reading and signing the agreement

The full text of the agreement is [here][sbca] and can be signed electronically
there. If you have any concerns please message kghosesbg or tag in an issue.

[sbca]: https://secure.na1.echosign.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhAYIK35OEVyaSeHV8_HAhxvLi8kvnyLEA2XPDjQWLbnIW58jAU6QSYzt-e8Wba-65k*

# Contributing to Rabix Composer

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