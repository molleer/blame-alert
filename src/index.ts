import * as github from "@actions/github";
import * as core from "@actions/core";
import Axios from "axios";
import { context } from "@actions/github/lib/utils";
import { Change, parseDiff, getAuthors, getUserNames } from "./utils";

const run = async (): Promise<void> => {
  //Checks if there have been a pull request
  const request = github.context.payload.pull_request;
  if (!request) {
    console.log("No pull request found");
    return;
  }

  //Fetches and parses diff
  const res = await Axios.get(request.diff_url);
  const changes: Change[] = parseDiff(res.data);
  console.log(changes);

  //Retrieves the usernames of the authors of the modified code
  const emails: string[] = await getAuthors(changes);
  const userNames: string[] = await getUserNames(emails);

  //Creates a message which will be commented on the PR
  let message = "Your code will change with this PR!";
  for (let i = 0; i < userNames.length; i++) {
    message += " @" + userNames[i];
  }

  //Commenting on the PR
  const octokit = github.getOctokit(core.getInput("GITHUB_TOKEN"));
  octokit.issues.createComment({
    ...context.repo,
    issue_number: request.number,
    body: message
  });
};

run();
