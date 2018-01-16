exports.checkAutomod = async function(subreddit, user, FCs) {

  var returnMessage = "";


  var automodText = await Reddit.getWikiPage(sails.config.reddit.adminRefreshToken, subreddit, 'config/automoderator');

  var splittedText = automodText.split("---\r\n");
  var rulesConverted = new Array();

  splittedText.forEach(function(rule) {

    var convertedRule = yaml.safeLoad(rule);
    if (convertedRule instanceof Object) { // skips all the commented rules
      try {
        var firstComment = rule.match(' *#.*')[0].toString().replace("#", "").trim();
      } catch (e) {
        firstComment = null;
      }
      if (firstComment) {
        convertedRule.firstComment = firstComment;
      }
    }
    rulesConverted.push(convertedRule);
  });

  FCs.forEach(function(FC) {
    rulesConverted.forEach(function(rule) {

      for (var name in rule) {

      var property = rule[name];

      // for cases where 'author' is array of nicknames
      if (name.includes("author") && !(name.includes("~author")) && (Array.isArray(rule[name]))) {

        if (property.includes(user)) {
          returnMessage += ("User " + user + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
        }
      }

      // for author with additional properties
      if (name.includes("author") && !(name.includes("~author")) && rule[name] instanceof Object) {
        for (var propName in property) {
          if (propName.includes("name") && !(propName.includes("~name"))) {
            if (property[propName].includes(user)) {
              returnMessage += ("User " + user + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
            }
          }

          if (propName.includes("flair_text") && !(propName.includes("~flair_text"))) {
            if ((rule.author['~name'] && (!(rule.author['~name'].includes(user)))) || !(rule.author['~name'])) {
              if (FC) {
                if (propName.includes("regex")) {

                  if (FC.match(property[propName][0])) {
                    returnMessage += ("FC " + FC + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
                  }
                } else {
                  if (property[propName].includes(FC)) {
                    returnMessage += ("FC " + FC + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
                  }
                }

              }

            }

          }


        }

      }

      // title and/or body regex checking
      if (name.includes("title") || (name.includes("body"))) {


        if (FC) {
          var expression = "";
          if (typeof property === "string") {
            expression = property;
          } else {
            expression = property[0];
          }
          if (FC.match(expression)) {
            returnMessage += ("FC " + FC + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
          }
        }
      }


      }
    });
  });
  return returnMessage;

};
