import * as core from "@actions/core";
import * as github from "@actions/github";

export async function run() {
  try {
    const { title, autoMerge, token, ...pullLocation } = getParams();

    const octokit = github.getOctokit(token);
    const { data: openPrs } = await octokit.rest.pulls.list({
      ...pullLocation,
      state: "open",
    });
    if (openPrs.length > 0) {
      core.info(`Pull request already exists: ${openPrs[0].html_url}`);
      return;
    }

    let { data: newPr } = await octokit.rest.pulls.create({
      ...pullLocation,
      title: title,
    });
    while (newPr.mergeable === null) {
      ({ data: newPr } = await octokit.rest.pulls.get({
        ...pullLocation,
        pull_number: newPr.number,
      }));
    }

    core.info(`Created pull request: ${newPr.html_url}`);
    core.setOutput("number", newPr.number);
    core.setOutput("url", newPr.html_url);

    if (!autoMerge) {
      core.info("Auto merge is disabled the pull request will not be merged.");
      return;
    }
    if (newPr.mergeable) {
      octokit.rest.pulls.merge({ ...pullLocation, pull_number: newPr.number });
      core.info("Merged pull request.");
    } else {
      core.setFailed(
        `Can not merge pull request state is ${newPr.mergeable_state}.`
      );
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

export function getParams() {
  const [owner, repo] = core.getInput("repo", { required: true }).split("/");
  let head = core.getInput("head", { required: true });
  if (!head.includes(":")) {
    head = `${owner}:${head}`
  }
  return {
    title: core.getInput("title", { required: true }),
    owner: owner,
    repo: repo,
    head: head,
    base: core.getInput("base", { required: true }),
    autoMerge: core.getBooleanInput("automerge", { required: true }),
    token: core.getInput("token", { required: true }),
  };
}

run();
