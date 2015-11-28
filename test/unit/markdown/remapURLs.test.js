var assert = require("chai").assert;
var remapURLs = require("../../../assets/markdown/remapURLs");

var markdownData = require("../data/markdownStrings.json");

describe("Markdown User URLs", function () {
  it("Replaces " + markdownData.userUrl + " with " + markdownData.userUrlAfter, function () {
    var test = remapURLs(markdownData.userUrl);
    assert.equal(test, markdownData.userUrlAfter, "Not mapping user urls correctly.");
  });

  it("Replaces " + markdownData.userUrlWithExtra + " with " + markdownData.userUrlWithExtraAfter, function () {
    var test = remapURLs(markdownData.userUrlWithExtra);
    assert.equal(test, markdownData.userUrlWithExtraAfter, "Not mapping user urls correctly.");
  });

  it("Replaces " + markdownData.userUrlWrong + " with " + markdownData.userUrlWrongAfter, function () {
    var test = remapURLs(markdownData.userUrlWrong);
    assert.equal(test, markdownData.userUrlWrongAfter, "Not mapping user urls correctly.");
  });
});

describe("Markdown Subreddit URLs", function () {
  it("Replaces " + markdownData.subUrl + " with " + markdownData.subUrlAfter, function () {
    var test = remapURLs(markdownData.subUrl);
    assert.equal(test, markdownData.subUrlAfter, "Not mapping sub urls correctly.");
  });

  it("Replaces " + markdownData.subUrlWithExtra + " with " + markdownData.subUrlWithExtraAfter, function () {
    var test = remapURLs(markdownData.subUrlWithExtra);
    assert.equal(test, markdownData.subUrlWithExtraAfter, "Not mapping sub urls correctly.");
  });

  it("Replaces " + markdownData.subUrlWrong + " with " + markdownData.subUrlWrongAfter, function () {
    var test = remapURLs(markdownData.subUrlWrong);
    assert.equal(test, markdownData.subUrlWrongAfter, "Not mapping sub urls correctly.");
  });
});