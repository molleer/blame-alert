import * as github from "@actions/github";

const run = async (): Promise<void> => {
  console.log(github.context);
  //git diff github.base_ref github.head_ref
};

run();
