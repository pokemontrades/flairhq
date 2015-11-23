module.exports = function (value) {
  var regex = /(href=")(\/[ur]\/[a-zA-Z_\/-]+)(")/g;
  return value.replace(regex, "$1https://www.reddit.com$2$3");
};