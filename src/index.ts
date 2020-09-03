import * as core from "@actions/core";

const run = async (): Promise<void> => {
  console.log(github.context);
  //git diff github.base_ref github.head_ref
};

run();
