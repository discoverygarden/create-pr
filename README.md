# Create Pull Request
![Test Worflow](https://github.com/discoverygarden/create-pr/actions/workflows/test.yml/badge.svg)

Workflow for creating and automatically merging pull requests.

## Usage

### Inputs

- `repo`: Repository name with owner. Defaults to current.
- `head`: Head branch to merge. Deafults to current branch.
- `base`: Base branch to merge into. Defaults to the current repo's default branch.
- `labels`: A comma seperated list of labels to add to the pull request.
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
