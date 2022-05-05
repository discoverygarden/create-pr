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
      core.info("Pull request already exists.");
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
      return;
    }
    if (newPr.mergeable) {
      octokit.rest.pulls.merge({ ...pullLocation, pull_number: newPr.number });
    } else {
      core.setFailed(
        `Can not merge pull request state is ${newPr.mergeable_state}.`
      );
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

function getParams() {
  const [owner, repo] = core.getInput("repo", { required: true }).split("/");
  return {
    title: core.getInput("title", { required: true }),
    owner: owner,
    repo: repo,
    head: core.getInput("head", { required: true }),
    base: core.getInput("base", { required: true }),
    autoMerge: core.getBooleanInput("automerge", { required: true }),
    token: core.getInput("token", { required: true }),
  };
}

run();
