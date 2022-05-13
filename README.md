# Create Pull Request
![Test Worflow](https://github.com/discoverygarden/create-pr/actions/workflows/test.yml/badge.svg)

Workflow for creating and automatically merging pull requests.

## Usage

### Inputs

- `repo`: Repository name with owner. Defaults to current repository or its parent if it's a fork.
- `head`: Head branch to merge. Defaults to the current branch. If creating a pull request against a parent repo prefix the branch name with `${{ owner }}:`
- `base`: Base branch to merge into. Defaults to the default branch the of the current repos or it's parent if it is a fork. 

- `automerge`: True if the pull request should be mergd automatically, default to `true`.
- `token`: GitHub access token.

### Outputs

- `url`: The URL of the pull request.
- `number`: The number of the pull request.

### Example Workflow

```yaml
name: Create Pull Request
on:
  push:
  branches: ['feat-*']

jobs:
  create-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: discoverygarden/create-pr@v1
        with:
          repo: discoverygarden/create-pr
          base: main
          automerge: false
          token: ${{ secrets.GITHUB_TOKEN}}
```
