var assert = require("chai").assert;
var Flairs = require("../../../api/services/Flairs");

var tradesFlairStd = "1111-1111-1111 || YMK (X)";
var tradesFlairMultipleFCs = "1111-1111-1111, 2222-2222-2222 || YMK (X)";
var svexFlairStd = "1111-1111-1111 || YMK (X) || 1234";
var svexFlairDifferentFC = "2222-2222-2222 || YMK (X) || 1234";
var incorrectFlair = "not a correct flair";

describe("Flair checks", function () {
  it("Throws error on incorrect pokemntrades flair", function () {
    try{
      Flairs.flairCheck(incorrectFlair, svexFlairStd);
    } catch (e) {
      return assert.equal(e, "Error with format.");
    }
    assert.fail(null, null, "Shouldn't reach this point.");
  });

  it("Throws error on incorrect svex flair", function () {
    try{
      Flairs.flairCheck(tradesFlairStd, incorrectFlair);
    } catch (e) {
      return assert.equal(e, "Error with format.");
    }
    assert.fail(null, null, "Shouldn't reach this point.");
  });

  it("Throws error on undefined trades flair", function () {
    try{
      Flairs.flairCheck(tradesFlairStd, undefined);
    } catch (e) {
      return assert.equal(e, "Need both flairs.");
    }
    assert.fail(null, null, "Shouldn't reach this point.");
  });

  it("Throws error on undefined trades flair", function () {
    try{
      Flairs.flairCheck(undefined, svexFlairStd);
    } catch (e) {
      return assert.equal(e, "Need both flairs.");
    }
    assert.fail(null, null, "Shouldn't reach this point.");
  });

  describe("On success", function () {
    it("Returns object containing friend codes", function () {
      var fcs = Flairs.flairCheck(tradesFlairStd, svexFlairStd).fcs;
      assert.equal(fcs.length, 1, "Has 1 fc.");
      assert.equal(fcs[0], "1111-1111-1111", "Has 1 fc.");
    });

    it("Returns object containing all friend codes", function () {
      var fcs = Flairs.flairCheck(tradesFlairMultipleFCs, svexFlairStd).fcs;
      assert.equal(fcs.length, 2, "Has 2 fcs.");
      assert.equal(fcs[0], "1111-1111-1111", "Has 1111-1111-1111");
      assert.equal(fcs[1], "2222-2222-2222", "Has 2222-2222-2222");
    });

    it("Returns object containing friend codes from both ", function () {
      var fcs = Flairs.flairCheck(tradesFlairStd, svexFlairDifferentFC).fcs;
      assert.equal(fcs.length, 2, "Has 2 fcs.");
      assert.equal(fcs[0], "1111-1111-1111", "Has 1111-1111-1111");
      assert.equal(fcs[1], "2222-2222-2222", "Has 2222-2222-2222");
    });
  });

  describe("Incorrect flairs", function () {
    it ("Doesn't allow no IGNs in trades flair", function () {
      try{
        Flairs.flairCheck("1234-1234-1234 || ", svexFlairStd);
      } catch (e) {
        return assert.equal(e, "We need at least 1 game.");
      }
      assert.fail(null, null, "Shouldn't reach this point.");
    });

    it ("Doesn't allow no IGNs in svex flair", function () {
      try{
        Flairs.flairCheck(tradesFlairStd, "1234-1234-1234 || || 1234");
      } catch (e) {
        return assert.equal(e, "We need at least 1 game.");
      }
      assert.fail(null, null, "Shouldn't reach this point.");
    });
  });
});