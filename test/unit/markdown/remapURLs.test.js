var assert = require("chai").assert;
var remapURLs = require("../../../assets/markdown/remapURLs");

var userUrl = "<a href=\"/u/test\">/u/test</a>";
var userUrlAfter = "<a href=\"https://www.reddit.com/u/test\">/u/test</a> (<a href=\"/u/test\">FlairHQ</a>)";
var userUrlWithExtra = "<a href=\"/u/test\">/u/test</a><a href=\"something\">something else</a>";
var userUrlWithExtraAfter = "<a href=\"https://www.reddit.com/u/test\">/u/test</a> (<a href=\"/u/test\">FlairHQ</a>)<a href=\"something\">something else</a>";
var userUrlWrong = "<a href=\"/u/test\">/u/not_test</a>";
var userUrlWrongAfter = userUrlWrong;

var subUrl = "<a href=\"/r/test\">/r/test</a>";
var subUrlAfter = "<a href=\"https://www.reddit.com/r/test\">/r/test</a>";
var subUrlWithExtra = "<a href=\"/r/test\">/r/test</a><a href=\"something\">something else</a>";
var subUrlWithExtraAfter = "<a href=\"https://www.reddit.com/r/test\">/r/test</a><a href=\"something\">something else</a>";
var subUrlWrong = "<a href=\"/r/test\">/r/not-test</a>";
var subUrlWrongAfter = subUrlWrong;

describe("replaceUserURLS", function () {
  it("Replaces " + userUrl + " with " + userUrlAfter, function () {
    var test = remapURLs(userUrl);
    assert.equal(test, userUrlAfter, "Not mapping user urls correctly.");
  });

  it("Replaces " + userUrlWithExtra + " with " + userUrlWithExtraAfter, function () {
    var test = remapURLs(userUrlWithExtra);
    assert.equal(test, userUrlWithExtraAfter, "Not mapping user urls correctly.");
  });

  it("Replaces " + userUrlWrong + " with " + userUrlWrongAfter, function () {
    var test = remapURLs(userUrlWrong);
    assert.equal(test, userUrlWrongAfter, "Not mapping user urls correctly.");
  });
});

describe("replaceSubURLS", function () {
  it("Replaces " + subUrl + " with " + subUrlAfter, function () {
    var test = remapURLs(subUrl);
    assert.equal(test, subUrlAfter, "Not mapping sub urls correctly.");
  });

  it("Replaces " + subUrlWithExtra + " with " + subUrlWithExtraAfter, function () {
    var test = remapURLs(subUrlWithExtra);
    assert.equal(test, subUrlWithExtraAfter, "Not mapping sub urls correctly.");
  });

  it("Replaces " + subUrlWrong + " with " + subUrlWrongAfter, function () {
    var test = remapURLs(subUrlWrong);
    assert.equal(test, subUrlWrongAfter, "Not mapping sub urls correctly.");
  });
});