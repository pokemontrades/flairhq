module.exports = function (value) {
  var userRegex = /(<a href=")\/(u\/[a-zA-Z0-9_\/-]+)(">)(\/?\2)(<\/a>)/g;
  var userReplaced = value.replace(userRegex, "$1https://www.reddit.com/$2$3$4$5 ($1/$2$3FlairHQ$5)");
  var subRegex = /(<a href=")\/(r\/[a-zA-Z0-9_\/-]+)(">)(\/?\2)(<\/a>)/g;
  return userReplaced.replace(subRegex, "$1https://www.reddit.com/$2$3$4$5");
};