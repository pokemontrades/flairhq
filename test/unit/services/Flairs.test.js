var assert = require("chai").assert;
var Flairs = require("../../../api/services/Flairs");

var flairTexts = require("../data/flairTexts.json");

describe("Flair checks", function () {
  it("Throws error on incorrect pokemntrades flair", function () {
    try{
      Flairs.flairCheck(flairTexts.incorrectFlair, flairTexts.svexFlairStd);
    } catch (e) {
      return assert.equal(e, "Error with format.");
    }
    assert.fail(null, null, "Shouldn't reach this point.");
  });

  it("Throws error on incorrect svex flair", function () {
    try{
      Flairs.flairCheck(flairTexts.tradesFlairStd, flairTexts.incorrectFlair);
    } catch (e) {
      return assert.equal(e, "Error with format.");
    }
    assert.fail(null, null, "Shouldn't reach this point.");
  });

  it("Throws error on undefined trades flair", function () {
    try{
      Flairs.flairCheck(flairTexts.tradesFlairStd, undefined);
    } catch (e) {
      return assert.equal(e, "Need both flairs.");
    }
    assert.fail(null, null, "Shouldn't reach this point.");
  });

  it("Throws error on undefined trades flair", function () {
    try{
      Flairs.flairCheck(undefined, flairTexts.svexFlairStd);
    } catch (e) {
      return assert.equal(e, "Need both flairs.");
    }
    assert.fail(null, null, "Shouldn't reach this point.");
  });

  describe("On success", function () {
    it("Returns object containing friend codes", function () {
      var fcs = Flairs.flairCheck(flairTexts.tradesFlairStd, flairTexts.svexFlairStd).fcs;
      assert.equal(fcs.length, 1, "Has 1 fc.");
      assert.equal(fcs[0], "1111-1111-1111", "Has 1 fc.");
    });

    it("Returns object containing all friend codes", function () {
      var fcs = Flairs.flairCheck(flairTexts.tradesFlairMultipleFCs, flairTexts.svexFlairStd).fcs;
      assert.equal(fcs.length, 2, "Has 2 fcs.");
      assert.equal(fcs[0], "1111-1111-1111", "Has 1111-1111-1111");
      assert.equal(fcs[1], "2222-2222-2222", "Has 2222-2222-2222");
    });

    it("Returns object containing friend codes from both ", function () {
      var fcs = Flairs.flairCheck(flairTexts.tradesFlairStd, flairTexts.svexFlairDifferentFC).fcs;
      assert.equal(fcs.length, 2, "Has 2 fcs.");
      assert.equal(fcs[0], "1111-1111-1111", "Has 1111-1111-1111");
      assert.equal(fcs[1], "2222-2222-2222", "Has 2222-2222-2222");
    });
  });

  describe("Incorrect flairs", function () {
    it ("Doesn't allow no IGNs in trades flair", function () {
      try{
        Flairs.flairCheck("1234-1234-1234 || ", flairTexts.svexFlairStd);
      } catch (e) {
        return assert.equal(e, "We need at least 1 game.");
      }
      assert.fail(null, null, "Shouldn't reach this point.");
    });

    it ("Doesn't allow no IGNs in svex flair", function () {
      try{
        Flairs.flairCheck(flairTexts.tradesFlairStd, "1234-1234-1234 || || 1234");
      } catch (e) {
        return assert.equal(e, "We need at least 1 game.");
      }
      assert.fail(null, null, "Shouldn't reach this point.");
    });
  });
});