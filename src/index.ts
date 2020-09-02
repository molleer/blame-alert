import * as core from "@actions/core";

const run = () => {
  core.setOutput("ACTIONS_RUNNER_DEBUG", "true");
  core.debug("Hello world");
};

run();
