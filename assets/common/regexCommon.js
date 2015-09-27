
define(["angular"], function (ng) {
  var ptradesFlair = "(([0-9]{4}-){2}[0-9]{4})(, (([0-9]{4}-){2}[0-9]{4}))* \\|\\| ([^ ,|(]*( \\((X|Y|ΩR|αS)(, (X|Y|ΩR|αS))*\\))?)(, ([^ ,|(]*( \\((X|Y|ΩR|αS)(, (X|Y|ΩR|αS))*\\))?))*";
  var regex = {
    tsv: "[0-3]\\d{3}|40(?:[0-8]\\d|9[0-5])",
    tsvBars: "(\\|\\| [0-9]{4})|(, [0-9]{4})",
    fc: "(([0-9]{4}-){2}[0-9]{4})",
    game: "((\\()|(,))(X|Y|ΩR|αS)((,)|(\\)))",
    ign: "((\\d \\|\\|)|(\\),)) [^(|,]*( (\\()|(\\|)|(,)|$)",

    ptradesFlair: ptradesFlair,
    svexFlair: ptradesFlair + " \\|\\| ([0-9]{4}|XXXX)(, (([0-9]{4})|XXXX))*"
  };

  var single = function (reg) {
    return new RegExp(reg);
  };
  var global = function (reg) {
    return new RegExp(reg, "g");
  };

  return {
    tsv: global(regex.tsvBars),
    fc: global(regex.fc),
    game: global(regex.game),
    ign: global(regex.ign),

    fcSingle: single(regex.fc),
    tsvSingle: single(regex.tsv),

    ptradesFlair : single(regex.ptradesFlair),
    svexFlair : single(regex.svexFlair)
  };
});