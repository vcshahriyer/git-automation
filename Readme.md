# GitHub Automation CLI Tool

This is a Node CLI tool to automate The boring stuff 🚀.

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/vcshahriyer/git-automation) ![npm (scoped)](https://img.shields.io/npm/v/@shahriyer/autogit) [![GitHub license](https://img.shields.io/github/license/vcshahriyer/GitAutomation)](https://github.com/vcshahriyer/GitAutomation/blob/master/LICENSE)

## Installation

> Install it globally and use across repositories with ease

```
npm i -g @shahriyer/autogit
```

## Usage

```
$ autogit help
```

![Usage](/assets/usage.png)

## **You can chain commands**

```
$ autogit nb p pr --backTo=main
```

![Usage](/assets/Demo.gif)

This will Create new branch ➡️ push ➡️ Open a Pull request ➡️ Checkout to `main` branch

## What's new in v.1.2.0!

-   Async Output to the terminal🐚.
-   Now you can ⛓️`chain` commands and flags🏳️.

## Upcoming

> Upcoming feature plan and teasers :

🔲 GitHub api integration to create and update PR.

🔲 Stash and checkout to expected branch.

🔲 All local or Selected branch Pull form immediate parent & push
(Updating branches for there dependent pull request).
