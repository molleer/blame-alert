import * as github from "@actions/github";
import * as git from "run-git-command";
import Axios from "axios";

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
  console.log(github.context);
  if (!github.context.payload.pull_request) {
    console.log("No base repo found");
    return;
  }

  //const base = github.context.payload.pull_request.base.ref;
  const diff_url = github.context.payload.pull_request.diff_url;

  const res = await Axios.get(diff_url);
  const changes: Change[] = parseDiff(res.data);
  console.log(changes);

  if (changes === []) return;

  /*
   * 2. Fetch the email of authors of deleted diff
   *     - Parse git blame --line-porcelain -L <lines> <file>
   */

  for (let i = 0; i < changes.length; i++) {
    git
      .execGitCmd([
        "blame",
        "--line-porcelain",
        "-L",
        changes[i].from + "," + changes[i].to
      ])
      .then(res => console.log(res));
  }

  /*
   * 3. use github-username to get the username of each user
   * 4. Write a comment, tagging all relevant users
   */
  //git diff github.base_ref github.head_ref
};

const parseDiff = (diff: string): Change[] => {
  const diffs = diff.split("diff --git");
  const changes: Change[] = [];

  for (let i = 0; i < diffs.length; i++) {
    const matchFile = diffs[i].match(/--- a\/.*?\+.*?/);
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
