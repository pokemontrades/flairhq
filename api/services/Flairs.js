var sha1 = require('node-sha1');

exports.formattedName = function(name) {
  if (!name) {
    return "";
  }
  var formatted = "",
    numberToSliceTill,
    suffix;
  if (name.indexOf("ball") > -1) {
    suffix = "Ball";
    numberToSliceTill = -4;
  } else if (name.indexOf("charm") > -1) {
    suffix = "Charm";
    numberToSliceTill = -5;
  } else if (name.indexOf("ribbon") > -1) {
    suffix = "Ribbon";
    numberToSliceTill = -6;
  } else if (name === "eggcup") {
    suffix = "Cup";
    numberToSliceTill = -3;
  } else if (name !== "egg" && name !== "involvement") {
    suffix = "Egg";
  }
  formatted += name.charAt(0).toUpperCase();
  formatted += name.slice(1, numberToSliceTill);
  if (suffix) {
    suffix = " " + suffix;
    formatted += suffix;
  }
  return formatted;
};

exports.validFC = function(code) {
  code = code.replace(/-/g,'');
  if (!code.match(/^\d{12}$/) || code > 549755813887) {
      return 0;
  }
  var checksum = Math.floor(code/4294967296);
  var byte_seq = (code % 4294967296).toString(16);
  while (byte_seq.length < 8) { byte_seq = "0"+byte_seq; }
  var byte_arr = byte_seq.match(/../g).reverse();
  var hash_seq = "";
  for (var i = 0; i < 4; i++) {
      hash_seq += String.fromCharCode(parseInt(byte_arr[i],16));
  }
  var new_chk = (parseInt(sha1(hash_seq).substring(0,2),16) >> 1);
  return (new_chk == checksum)?1:0;
};

exports.flairCheck = function (ptrades, svex) {
  var ptradesFlair = "(([0-9]{4}-){2}[0-9]{4})(, (([0-9]{4}-){2}[0-9]{4}))* \\|\\| ([^,|(]*( \\((X|Y|ΩR|αS)(, (X|Y|ΩR|αS))*\\))?)(, ([^,|(]*( \\((X|Y|ΩR|αS)(, (X|Y|ΩR|αS))*\\))?))*";
  var svExFlair = ptradesFlair + " \\|\\| ([0-9]{4}|XXXX)(, (([0-9]{4})|XXXX))*";

  var response = {
    correct: true,
    error: null,
    ptrades: ptrades,
    svex: svex,
    fcs: []
  };

  if (!req.allParams().ptrades.match(new RegExp(ptradesFlair)) || !req.allParams().svex.match(new RegExp(svExFlair))) {
    response.error = "Error with format.";
  }

  response.fcs = _.union(flairs.ptrades.match(/(\d{4}-){2}\d{4}/g), svexFlair.flair.match(/(\d{4}-){2}\d{4}/g));

  return response;
};