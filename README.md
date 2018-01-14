# RemoteData

Hey!

The project's aim is to facilitate access to any data on the backend with unified interface. As Observables from rxjs
library are very widely used to handle data in frontend application, this application focuses on Observable interfaces
for various data sources. The usage of the library is targeted to Angular 2 and higher.

The project consists of two parts:
1. The library in `src/lib` which is going to be distributed by npm
2. The demo app in `src/app` present only in cloned repository

What is done:
1. A factory class for REST services: classes RestService and RestItem
2. A a RemoteData class which provides an interface to fetch and asynchronously update non-REST data over HTTP protocol.
3. A synchronization class for RestData called Synchronizer, to refresh RemoteData in fixed period of time.

What is for sure TODO:
1. Add Websockets protocol to RemoteData
2. Handle error codes at RestService
3. Make demo app.
4. A documentation generated from docstrings.

A further roadmap:
1. A unified data object to exchange data with a backend server to be able to use RestItem without a need of implementation of the abstract methods.

I will be glad if you want to contribute. If you find any bugs please report with Github.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.0.

# Usage

## Running unit tests

Run `npm test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Build

Run `npm run build` to build the library. Alternatively run `npm run build:ts` to build the library as Typescript for easier debugging. The build artifacts will be stored in the `dist/` directory.

## Demo app server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
