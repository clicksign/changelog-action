<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# About this

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
    ✓ should read file not found (8 ms)
    ✓ should read file (3 ms)
    ✓ should mount final log with one line
    ✓ should mount final log with multi line
    ✓ should mount final log with four line (1 ms)
    ✓ should mount final log with four line (1 ms)
    ✓ should create new version release in changelog
    ✓ should quantity logs in last release (1 ms)

...
```

## Change action.yml

The action.yml defines news inputs and output for action.

| Inputs                       |    required   |    default   |                  description                  |
|------------------------------|:-------------:|-------------:|:---------------------------------------------:|
| changelog_file_name          | falase        | CHANGELOG.md | add changelog file name                       |
| changelog_new_log            | true          | null         | add new log                                   |
| changelog_new_comments       | false         | null         | add new comments                              |
| log_find                     | true          | null         | add the key where the log below will be added |
| comment_find                 | false         | null         | add the key where the log below will be added |
| encoding                     | false         | utf-8        | add encoded read file                         |
| repo_main                    | false         | heads/main   | Name main repository                          |
| payload                      | false         | null         | Paylod send slack message                     |
| max_logs                     | false         | 5            | Quantity max logs in changlog                 |


## Example

```javascript
jobs:
  check-dist:
    runs-on: ubuntu-latest
    if: "startsWith(github.event.head_commit.message, 'Merge')"
    steps:
      - name: Checkout Github
        uses: actions/checkout@v2

      - name: Get Title PR
        id: get_message
        run: echo "::set-output name=MESSAGE::$(echo '${{github.event.head_commit.message}}' | tail -n 1)"

      - name: Update Changelog
        uses: clicksign/changelog-action
        with:
          changelog_new_log: ${{ steps.get_message.outputs.MESSAGE }}
          log_find: '## Alterações'
        env:
          GITHUB_TOKEN: ${{secrets.PERSONAL_TOKEN}}
          SLACK_WEBHOOK_URL: ${{secrets.SLACK_WEBHOOK_URL}}
```