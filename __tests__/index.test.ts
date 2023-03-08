import { run, getParams } from "../src/index";
import * as github from "@actions/github";
import * as core from "@actions/core";

jest.mock("@actions/github");

const octokit = github.getOctokit("_");
const listPullsMock = jest.spyOn(octokit.rest.pulls, "list");
const createPullMock = jest.spyOn(octokit.rest.pulls, "create");
const getPullMock = jest.spyOn(octokit.rest.pulls, "get");
const mergePullMock = jest.spyOn(octokit.rest.pulls, "merge");
const addLabelsMock = jest.spyOn(octokit.rest.issues, "addLabels");

jest.mock("@actions/core");
const inputs: { [key: string]: string } = {
  title: "Pull Request",
  repo: "username/myrepo",
  head: "head-branch",
  base: "base-branch",
  token: "_",
  labels: "label 1, label 2"
};
jest
  .spyOn(core, "getInput")
  .mockImplementation((id: string, ...params) => inputs[id]);

const unknownPull = {
  data: {
    mergeable: null,
    mergeable_state: "unknown",
    number: 2,
  },
};
const mergablePull = {
  data: {
    mergeable: true,
    mergeable_state: "clean",
    number: 2,
  },
};
const dirtyPull = {
  data: {
    mergeable: false,
    mergeable_state: "dirty",
    number: 2,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("run", () => {
  it("exits after existing pr", async () => {
    listPullsMock.mockResolvedValue(<any>{ data: [null] });

    await run();

    expect(createPullMock).not.toBeCalled();
    expect(getPullMock).not.toBeCalled();
  });

  it("waits to see if mergable", async () => {
    listPullsMock.mockResolvedValue(<any>{ data: [] });
    createPullMock.mockResolvedValue(<any>unknownPull);
    getPullMock.mockReturnValueOnce(<any>unknownPull);
    getPullMock.mockReturnValueOnce(<any>mergablePull);

    await run();

    expect(createPullMock).toBeCalled();
    expect(getPullMock).toBeCalledTimes(2);
  });

  it("merge if mergeable and auto merge enabled", async () => {
    listPullsMock.mockResolvedValue(<any>{ data: [] });
    createPullMock.mockResolvedValue(<any>unknownPull);
    getPullMock.mockReturnValueOnce(<any>mergablePull);
    jest.spyOn(core, "getBooleanInput").mockReturnValue(true);

    await run();

    expect(mergePullMock).toBeCalled();
  });

  it("do not merge if mergeable and auto merge disabled", async () => {
    listPullsMock.mockResolvedValue(<any>{ data: [] });
    createPullMock.mockResolvedValue(<any>unknownPull);
    getPullMock.mockReturnValueOnce(<any>mergablePull);
    jest.spyOn(core, "getBooleanInput").mockReturnValue(false);

    await run();

    expect(mergePullMock).not.toBeCalled();
  });

  it("do not merge if not mergeable", async () => {
    listPullsMock.mockResolvedValue(<any>{ data: [] });
    createPullMock.mockResolvedValue(<any>unknownPull);
    getPullMock.mockReturnValueOnce(<any>dirtyPull);
    jest.spyOn(core, "getBooleanInput").mockReturnValue(true);

    await run();

    expect(mergePullMock).not.toBeCalled();
  });

  it("adds labels to the pull request when labels added", async () => {
    listPullsMock.mockResolvedValue(<any>{ data: [] });
    createPullMock.mockResolvedValue(<any>{ data: { number: 1 } });

    await run();

    expect(addLabelsMock).toBeCalledTimes(1);
    expect(addLabelsMock).toBeCalledWith({
      owner: "username",
      repo: "myrepo",
      issue_number: 1,
      labels: ["label 1", "label 2"],
    });
  });
});

describe("getParams", () => {
  it("prepends owner to head if missing", () => {
    const inputs: { [key: string]: string } = {
      repo: "username/repo",
      head: "head-branch",
    };
    jest
      .spyOn(core, "getInput")
      .mockImplementation((id: string, ...params) =>
        id in inputs ? inputs[id] : "-"
      );

    expect(getParams().head).toEqual("username:head-branch");
  });

  it("does not prepend owner to head if present", () => {
    const inputs: { [key: string]: string } = {
      repo: "username/repo",
      head: "username:head-branch",
    };
    jest
      .spyOn(core, "getInput")
      .mockImplementation((id: string, ...params) =>
        id in inputs ? inputs[id] : "-"
      );

    expect(getParams().head).toEqual("username:head-branch");
  });

  it("returns a list of labels from the comma seperated string of labels provided", () => {
    const inputs: { [key: string]: string } = {
      labels: "label 1, label 2",
    };
    jest
      .spyOn(core, "getInput")
      .mockImplementation((id: string, ...params) =>
        id in inputs ? inputs[id] : "-"
      );

    expect(getParams().labels).toEqual(["label 1", "label 2"]);
  });

  it("returns empty array if no labels are set on input", () => {
    const inputs: { [key: string]: string } = {
      labels: "",
    };
    jest
      .spyOn(core, "getInput")
      .mockImplementation((id: string, ...params) =>
        id in inputs ? inputs[id] : "-"
      );

    expect(getParams().labels).toEqual([]);
  });
});
