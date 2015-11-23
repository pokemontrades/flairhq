module.exports = function (value) {
  var userRegex = /(<a href=")(\/[u]\/[a-zA-Z_\/-]+)(">)(.*)(<\/a>)/g;
  var usersReplaced = value.replace(userRegex, "$1https://www.reddit.com$2$3$4$5 ($1$2$3FlairHQ$5)");
  var subRegex = /(<a href=")(\/[r]\/[a-zA-Z_\/-]+)(">)(.*)(<\/a>)/g;
  return usersReplaced.replace(subRegex, "$1https://www.reddit.com$2$3$4$5");
};