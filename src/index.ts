import * as core from "@actions/core";
import * as git from "run-git-command";

core.debug("Hello from before");

const run = async (): Promise<void> => {
  core.debug("Hello world");
  //git diff github.base_ref github.head_ref
};

run();
