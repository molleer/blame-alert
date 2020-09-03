import * as assert from "assert";
import { parseDiff, parseBlame, getUserNames } from "./utils";

const diff =
  "diff --git a/README.md b/README.md\n" +
  "index 95a2896..267ee18 100644\n" +
  "--- a/README.md\n" +
  "+++ b/README.md\n" +
  "@@ -20,3 +20,7 @@ should be running at\n" +
  " ```\n" +
  " \n" +
  " Traefik will work as you default ingress controller\n" +
  "+\n" +
  "+# Gihub Actions\n" +
  "+\n" +
  "+Coming documentation soon\n";

const blame =
  "2ab800e13bc047c7667edffb2b72adb2456e19c1 1 1 2\n" +
  "author David Möller\n" +
  "author-mail <31804935+molleer@users.noreply.github.com>\n" +
  "author-time 1599060125\n" +
  "author-tz +0200\n" +
  "committer GitHub\n" +
  "committer-mail <noreply@github.com>\n" +
  "committer-time 1599060125\n" +
  "committer-tz +0200\n" +
  "summary Initial commit\n" +
  "boundary\n" +
  "filename README.md\n" +
  "        # blame-alert\n" +
  "2ab800e13bc047c7667edffb2b72adb2456e19c1 2 2\n" +
  "author David Möller\n" +
  "author-mail <31804935+molleer@users.noreply.github.com>\n" +
  "author-time 1599060125\n" +
  "author-tz +0200\n" +
  "committer GitHub\n" +
  "committer-mail <noreply@github.com>\n" +
  "committer-time 1599060125\n" +
  "committer-tz +0200\n" +
  "summary Initial commit\n" +
  "boundary\n" +
  "filename README.md\n" +
  "        Gihub action which tags users whose code has been removed in a PR";

describe("Testing the 'parseDiff' method", () => {
  it("Should parse the diff to a change object", () => {
    const changes = parseDiff(diff);
    assert.deepEqual(changes[0], { file: "README.md", from: 20, to: 23 });
  });
});

describe("Testing the 'parseBlame' method", () => {
  it("Should return the email of the authors", () => {
    const emails = parseBlame(blame);
    assert.equal(emails[0], "31804935+molleer@users.noreply.github.com");
  });
});

describe("Testing the 'getUsernames' method", () => {
  it("Should return the usernames of the user with the specified emails", async () => {
    const usernames: string[] = await getUserNames([
      "31804935+molleer@users.noreply.github.com"
    ]);
    assert.equal(usernames[0], "molleer");
  });
});
