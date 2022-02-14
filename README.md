<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# About

Action created by clicksign's devops team, this action has the main objective of automating the changelog updates, thus preventing conflicts in the changelog 

# Create a JavaScript Action using TypeScript

Use this template to bootstrap the creation of a TypeScript action.:rocket:

This template includes compilation support, tests, a validation workflow, publishing, and versioning guidance.  

If you are new, there's also a simpler introduction.  See the [Hello World JavaScript Action](https://github.com/actions/hello-world-javascript-action)

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ yarn
```

Build the typescript and package it for distribution
```bash
$ yarn build && yarn package
```

Run the tests :heavy_check_mark:  
```bash
$ yarn test

 PASS  __tests__/main.test.ts
  Cangelog Action
    ✓ should read file not found (6 ms)
    ✓ should read file (2 ms)
    ✓ should mount final log with one line
    ✓ should mount final log with multi line (11 ms)

...
```

## Change action.yml

The action.yml defines news inputs and output for action.
