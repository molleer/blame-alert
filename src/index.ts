import * as github from "@actions/github";
import * as core from "@actions/core";
import * as git from "run-git-command";
import Axios from "axios";
import { Change, parseDiff, getUserNames, parseBlame, handle } from "./utils";

const run = async (): Promise<void> => {
  const request = github.context.payload.pull_request;
  const token = core.getInput("GITHUB_TOKEN");
  const octokit = github.getOctokit(token);

  //Checks if there have been a pull request
  if (!request) {
    console.log("No pull request found");
    return;
  }

  //Fetches and parses diff
  const res = await Axios.get(request.diff_url).catch(err =>
    handle("Failed to fetch diff file, perhaps the repo is private", err, {
      data: ""
    })
  );
  const changes: Change[] = parseDiff(res.data);

  //Retrieves the usernames of the authors of the modified code
  const emails: string[] = await getAuthors(changes).catch(err =>
    handle("Failed to fetch author emails", err, [])
  );
  let userNames: string[] = await getUserNames(emails).catch(() => []);
  userNames = userNames.filter(name => name !== github.context.actor);

  if (userNames.length == 0) {
    console.log("No users to be alerted");
    return;
  }

  //Creates a message which will be commented on the PR
  let message = "Your code will change with this PR!";
  for (let i = 0; i < userNames.length; i++) {
    message += " @" + userNames[i];
  }

  //Commenting on the PR
  octokit.issues.createComment({
    ...github.context.repo,
    issue_number: request.number,
    body: message
  });
};

/**
 * Fetches author emails
 * @param changes all changes in the code
 * @return the email of each author whose code has been modified
 */
const getAuthors = async (changes: Change[]): Promise<string[]> => {
  const emails: string[] = [];
  for (let i = 0; i < changes.length; i++) {
    const blame = await git
      .execGitCmd([
        "blame",
        "--line-porcelain",
        "-L",
        changes[i].from + "," + changes[i].to,
        changes[i].file
      ])
      .catch(err => handle("Unable to execute git blame command", err, ""));

    emails.push(...parseBlame(String(blame)));
  }
  return [...new Set(emails)];
};

run();
