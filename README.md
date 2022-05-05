# Create Pull Request

Workflow for creating and automatically merging pull requests.

## Usage

### Inputs

- `repo`: Repository name with owner, defaults to current.
- `head`: Head branch to merge, deafults to current branch.
- `base`: Base branch to merge into.
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