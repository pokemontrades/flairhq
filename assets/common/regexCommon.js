var ptradesFlair = "((?:SW-)?([0-9]{4}-){2}[0-9]{4})(, ((?:SW-)?([0-9]{4}-){2}[0-9]{4}))* \\|\\| ([^ ,|(]*( \\((X|Y|ΩR|αS|S|M|US|UM|LGP|LGE|SW|SH)(, (X|Y|ΩR|αS|S|M|US|UM|LGP|LGE|SW|SH))*\\))?)(, ([^ ,|(]*( \\((X|Y|ΩR|αS|S|M|US|UM|LGP|LGE|SW|SH)(, (X|Y|ΩR|αS|S|M|US|UM|LGP|LGE|SW|SH))*\\))?))*";
var regex = {
  tsv: "[0-3]\\d{3}|40(?:[0-8]\\d|9[0-5])",
  tsvBars: "(\\|\\| [0-9]{4})|(, [0-9]{4})",
  fc: "((?:SW-)?([0-9]{4}-){2}[0-9]{4})",
  console: "Switch|3DS",
  game: "((\\()|(,))(X|Y|ΩR|αS|S|M|US|UM|LGP|LGE|SW|SH)((,)|(\\)))",
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

module.exports = {
  tsv: global(regex.tsvBars),
  fc: global(regex.fc),
  game: global(regex.game),
  ign: global(regex.ign),

  fcSingle: single(regex.fc),
  consoleSingle: single(regex.console),
  tsvSingle: single(regex.tsv),

  ptradesFlair: single(regex.ptradesFlair),
  svexFlair: single(regex.svexFlair)
};
