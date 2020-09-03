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
  authors?: string[];
}

const run = async (): Promise<void> => {
  /**
   * 1. Fetch the diff between tow branches
   *      - Get the branch names of base and current
   */

  if (!github.context.payload.pull_request) {
    console.log("No base repo found");
    return;
  }

  const diff_url = github.context.payload.pull_request.diff_url;

  const res = await Axios.get(diff_url);
  const changes: Change[] = parseDiff(res.data);
  console.log(changes);

  if (changes === []) return;

  /*
   * 2. Fetch the email of authors of deleted diff
   *     - Parse git blame --line-porcelain -L <lines> <file>
   */

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
  console.log(emails);

  /*
   * 3. use github-username to get the username of each user
   */

  const userNames: string[] = [];
  const emailSet = [...new Set(emails)];
  for (let i = 0; i < emailSet.length; i++) {
    const username: string = await githubUsername(emails[i]).catch(() => "");
    userNames.push(username);
  }

  console.log(userNames);

  /*
   * 4. Write a comment, tagging all relevant users
   */

  let message = "Your code will change with this PR!";

  for (let i = 0; i < userNames.length; i++) {
    message += " @" + userNames[i];
  }

  const octokit = github.getOctokit(core.getInput("GITHUB_TOKEN"));
  octokit.issues.createComment({
    ...context.repo,
    issue_number: github.context.payload.pull_request.number,
    body: message
  });
  //git diff github.base_ref github.head_ref
};

const parseBlame = (blame: string): string[] => {
  const foundMails = blame.match(/author-mail <.*?>/g);
  if (!foundMails) return [];
  return foundMails.map(mail => mail.substr(13, mail.length - 14));
};

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
