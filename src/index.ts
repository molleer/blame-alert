import * as github from "@actions/github";
import * as git from "run-git-command";
import Axios from "axios";

const run = async (): Promise<void> => {
  /**
   * 1. Fetch the diff between tow branches
   *      - Get the branch names of base and current
   */
  console.log(github.context);
  if (github.context.payload.pull_request) {
    console.log(github.context.payload.pull_request.head);
    console.log(github.context.payload.pull_request.diff_url);
  }

  const base = github.context.payload.base_ref;
  console.log(`Pull request base: ${base}`);
  if (!base) {
    console.log("No base repo found");
    return;
  }

  git
    .execGitCmd(["diff", base])
    .then(res => console.log(res))
    .catch(err => {
      console.log("Something faild while trying to get diff");
      console.log(err);
    });
  /*
   * 2. Fetch the email of authors of deleted diff
   *     - Parse git blame --line-porcelain -L <lines> <file>
   * 3. use github-username to get the username of each user
   * 4. Write a comment, tagging all relevant users
   */
  //git diff github.base_ref github.head_ref
};

run();
