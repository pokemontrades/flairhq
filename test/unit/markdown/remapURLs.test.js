var assert = require("chai").assert;
var remapURLs = require("../../../assets/markdown/remapURLs");

describe("replaceUserURLS", function () {
  it("Replaces /u/test with http://www.reddit.com/u/test", function () {
    var test = remapURLs('<a href="/u/test">/u/test</a>');
    assert.equal(test, '<a href="https://www.reddit.com/u/test">/u/test</a> (<a href="/u/test">FlairHQ</a>)', "Not mapping user urls correctly.")
  });
});

describe("replaceSubURLS", function () {
  it("Replaces /u/test with http://www.reddit.com/u/test", function () {
    var test = remapURLs('<a href="/r/test">/r/test</a>');
    assert.equal(test, '<a href="https://www.reddit.com/r/test">/r/test</a>', "Not mapping sub urls correctly.")
  });
});