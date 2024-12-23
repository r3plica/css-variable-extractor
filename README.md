# CssVariableExtractor

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# Git Flow

If you have just cloned the repo, you will need to init git flow

```
git flow init
```

## Scripts

When running scripts to help with git flow, you first need to give executable permissions:

```
chmod +x ./scripts/*
```

## Releases

With all scripts you can just run them

```
npm run <feature|hotfix|release>-<start|finish>
```

But with releases, you may want to increment the Major/Minor and you can do this by adding an optional parameter

```
npm run release-start minor
```
