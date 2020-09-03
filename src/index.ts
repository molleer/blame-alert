import * as github from "@actions/github";
import * as git from "run-git-command";
import * as core from "@actions/core";
import githubUsername from "github-username";
import Axios from "axios";
import { context } from "@actions/github/lib/utils";

interface Change {
  from: number;
  to: number;
  file: string;
}

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

  //Retrieves the emails of the authors of the modified code
  const emails: string[] = [];
  for (let i = 0; i < changes.length; i++) {
    const blame = await git.execGitCmd([
      "blame",
      "--line-porcelain",
      "-L",
      changes[i].from + "," + changes[i].to,
      changes[i].file
    ]);

    emails.push(...parseBlame(String(blame)));
  }

  //Fetching user names using their emails
  let userNames: string[] = [];
  const emailSet = [...new Set(emails)];
  for (let i = 0; i < emailSet.length; i++) {
    const username: string = await githubUsername(emails[i]).catch(() => "");
    userNames.push(username);
  }
  userNames = [...new Set(userNames)];

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

/**
 * Returns the author emails of blame response
 * @param blame the blame response
 */
const parseBlame = (blame: string): string[] => {
  const foundMails = blame.match(/author-mail <.*?>/g);
  if (!foundMails) return [];
  return foundMails.map(mail => mail.substr(13, mail.length - 14));
};

/**
 * Parses the git diff output to a list of Change objects
 * @param diff the diff output
 */
const parseDiff = (diff: string): Change[] => {
  const diffs = diff.split("diff --git");
  const changes: Change[] = [];

  for (let i = 0; i < diffs.length; i++) {
    const matchFile = diffs[i].match(/--- a\/.*\n/);
    const lines = diffs[i].match(/@@ -[0-9]*,[0-9]* \+[0-9]*,[0-9]* @@/g);

    if (!lines || !matchFile) continue;
    const file = matchFile[0].substr(6, matchFile[0].length - 7);

    for (let l = 0; l < lines.length; l++) {
      const startLine = lines[l].match(/@@ -[0-9]*/);
      const steps = lines[l].match(/,[0-9]* \+/);
      if (!startLine || !steps) continue;

      const from = Number(startLine[0].substr(4));
      const to = Number(steps[0].substr(1, steps[0].length - 3)) + from;
      changes.push({
        file: file,
        from: from,
        to: to
      });
    }
  }

  return changes;
};

run();
