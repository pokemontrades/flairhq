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
