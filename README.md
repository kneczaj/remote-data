# RemoteData

Hey!

The project's aim is to facilitate access to any data on the backend with unified interface. As Observables from rxjs
library are very widely used to handle data in frontend application, this application focuses on Observable interfaces
for various data sources. The usage of the library is targeted to Angular 2 and higher.

The project consists of two parts:
1. The library in `src/lib` which is going to be distributed by npm
2. The demo app in `src/app` present only in cloned repository

What is for sure TODO:
1. Add Websockets protocol to RemoteData
2. Make demo app.
3. A documentation generated from docstrings.

A further roadmap:
1. A unified data object to exchange data with a backend server to be able to use RestItem without a need of implementation of the abstract methods.

I will be glad if you want to contribute. If you find any bugs please report with Github.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.0.

# Release notes

## 0.2.0 - Beta
This is the first version tested with a simple backend server. It was tested together with a backend working with MongoDB. The IDs of REST items were in string format. This version requires HttpClient from Angular >=4.3 so may need app adaptation.

Changes:
- Synchronizer deleted, please use Observable.timer with concatMap/switchMap from RxJS instead
- Migration to HttpClient & Angular>=4.3
- Object IDs can be in string format instead of numbers so it is possible to use the lib e.g. with MongoDB on backend
- Some properties of RestService and RestServiceBase are made protected so it is possible to easier extend and customize the classes
- Minor bug fixes


## 0.1.0 - Alpha
- A factory class for REST services: classes RestService and RestItem
- A a RemoteData class which provides an interface to fetch and asynchronously update non-REST data over HTTP protocol.
- A synchronization class for RestData called Synchronizer, to refresh RemoteData in fixed period of time.

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
