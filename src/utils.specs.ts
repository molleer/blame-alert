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
  "c400a404224acd4431858b70b8b5394b0340ccbe 1 1 1\n" +
  "author David Möller\n" +
  "author-mail <davidm@student.chalmers.se>\n" +
  "author-time 1599201270\n" +
  "author-tz +0200\n" +
  "committer David Möller\n" +
  "committer-mail <davidm@student.chalmers.se>\n" +
  "committer-time 1599201270\n" +
  "committer-tz +0200\n" +
  "summary Changed first line\n" +
  "previous b46c3de5efb5b6890f2ec5e0f096744fc12b08fd newFile.txt\n" +
  "filename newFile.txt\n" +
  "	This is a new line\n" +
  "b46c3de5efb5b6890f2ec5e0f096744fc12b08fd 2 2 4\n" +
  "author davmoller99\n" +
  "author-mail <67462443+davmoller99@users.noreply.github.com>\n" +
  "author-time 1599201158\n" +
  "author-tz +0200\n" +
  "committer GitHub\n" +
  "committer-mail <noreply@github.com>\n" +
  "committer-time 1599201158\n" +
  "committer-tz +0200\n" +
  "summary Create newFile.txt\n" +
  "filename newFile.txt\n" +
  "	is\n" +
  "b46c3de5efb5b6890f2ec5e0f096744fc12b08fd 3 3\n" +
  "author davmoller99\n" +
  "author-mail <67462443+davmoller99@users.noreply.github.com>\n" +
  "author-time 1599201158\n" +
  "author-tz +0200\n" +
  "committer GitHub\n" +
  "committer-mail <noreply@github.com>\n" +
  "committer-time 1599201158\n" +
  "committer-tz +0200\n" +
  "summary Create newFile.txt\n" +
  "filename newFile.txt\n" +
  "	a\n" +
  "b46c3de5efb5b6890f2ec5e0f096744fc12b08fd 4 4\n" +
  "author davmoller99\n" +
  "author-mail <67462443+davmoller99@users.noreply.github.com>\n" +
  "author-time 1599201158\n" +
  "author-tz +0200\n" +
  "committer GitHub\n" +
  "committer-mail <noreply@github.com>\n" +
  "committer-time 1599201158\n" +
  "committer-tz +0200\n" +
  "summary Create newFile.txt\n" +
  "filename newFile.txt\n" +
  "	new\n" +
  "b46c3de5efb5b6890f2ec5e0f096744fc12b08fd 5 5\n" +
  "author davmoller99\n" +
  "author-mail <67462443+davmoller99@users.noreply.github.com>\n" +
  "author-time 1599201158\n" +
  "author-tz +0200\n" +
  "committer GitHub\n" +
  "committer-mail <noreply@github.com>\n" +
  "committer-time 1599201158\n" +
  "committer-tz +0200\n" +
  "summary Create newFile.txt\n" +
  "filename newFile.txt\n" +
  "	file\n";

describe("Testing the 'parseDiff' method", () => {
  it("Should parse the diff to a change object", () => {
    const changes = parseDiff(diff);
    assert.deepEqual(changes[0], { file: "README.md", from: 20, to: 23 });
  });
});

describe("Testing the 'parseBlame' method", () => {
  it("Should return the email of the authors", () => {
    const emails = parseBlame(blame);
    assert.deepEqual(emails, [
      "davidm@student.chalmers.se",
      "67462443+davmoller99@users.noreply.github.com"
    ]);
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
