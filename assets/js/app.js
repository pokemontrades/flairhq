/* global io, angular */

var fapp = angular.module("fapp",
  ['angularSpinner',
    'ngReallyClickModule',
    'numberPadding',
    'yaru22.md'
  ]);

fapp.controller("referenceCtrl", ['$scope', '$filter', function ($scope, $filter) {
  $scope.newStuff = {
    newComment: ""
  };
  $scope.modSaveError = "";
  $scope.ok = {
    approveAll: {}
  };
  $scope.spin = {
    approveAll: {}
  };
  $scope.saving = {};
  $scope.refUser = {
    name: window.location.pathname.substring(3)
  };
  $scope.selectedRef = {};
  $scope.referenceToRevert = {};
  $scope.indexOk = {};
  $scope.indexSpin = {};


  $scope.editReference = function (ref) {
    $scope.selectedRef = ref;
    $scope.referenceToRevert = $.extend(true, {}, ref);
  };

  $scope.revertRef = function () {
    var index = $scope.user.references.indexOf($scope.selectedRef);
    $scope.user.references[index] = $.extend(true, {}, $scope.referenceToRevert);
  };

  $scope.editRef = function () {
    $scope.editRefError = "";
    $scope.indexOk.editRef = false;
    var ref = $scope.selectedRef,
        url = "/reference/edit",
        regexp = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((pokemontrades)|(SVExchange)|(poketradereferences))\/comments\/([a-z\d]*)\/([^\/]+)\/([a-z\d]+)(\?[a-z\d]+)?/,
        regexpGive = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((SVExchange)|(poketradereferences)|(Pokemongiveaway)|(SVgiveaway))\/comments\/([a-z\d]*)\/([^\/]+)\/?/,
        regexpMisc = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com.*/,
        regexpUser = /^(\/u\/)?[A-Za-z0-9_\-]*$/;

    if (!ref.type) {
      $scope.editRefError = "Please choose a type.";
      return;
    }
    if (ref.type === "egg" || ref.type === "giveaway" || ref.type === "misc") {
      if (!ref.description) {
        $scope.editRefError = "Make sure you enter all the information";
        return;
      }
    } else {
      if (!ref.got || !ref.gave) {
        $scope.editRefError = "Make sure you enter all the information";
        return;
      }
    }
    if (!ref.url ||
        ((ref.type !== "giveaway" && ref.type !== "misc") && !ref.user2)) {
      $scope.editRefError = "Make sure you enter all the information";
      return;
    }
    if ((ref.type === "giveaway" && !regexpGive.test(ref.url)) ||
        (ref.type !== "giveaway" && ref.type !== "misc" &&
        !regexp.test(ref.url)) ||
        (ref.type === "misc" && !regexpMisc.test(ref.url))) {
      $scope.editRefError = "Looks like you didn't input a proper permalink";
      return;
    }

    if (ref.user2.indexOf("/u/") === -1) {
      ref.user2 = "/u/" + ref.user2;
    }

    if (ref.user2 === ("/u/" + $scope.user.name)) {
      $scope.addRefError = "Don't put your own username there.";
      return;
    }

    if(($scope.type !== "giveaway" && $scope.type !== "misc") && !regexpUser.test(user2)) {
      $scope.addRefError = "Please put a username on it's own, or in format: /u/username. Not the full url, or anything else.";
      return;
    }

    $scope.indexSpin.editRef = true;
    io.socket.post(url, ref, function (data, res) {
      $scope.indexSpin.editRef = false;
      if (res.statusCode !== 200) {
        $scope.editRefError = "There was an issue.";
        console.log(res);
      } else {
        $scope.indexOk.editRef = true;
      }
      $scope.$apply();
    });

  };

  $scope.isEvent = function (el) {
    return el.type === "event" || el.type === "redemption";
  };

  $scope.isShiny = function (el) {
    return el.type === "shiny";
  };

  $scope.isCasual = function (el) {
    return el.type === "casual";
  };

  $scope.numberOfTrades = function () {
    if (!$scope.refUser.references) {
      return 0;
    }
    var refs = $scope.refUser.references;
    var event = $filter("filter")(refs, $scope.isEvent).length;
    var shiny = $filter("filter")(refs, $scope.isShiny).length;
    var casual = $filter("filter")(refs, $scope.isCasual).length;
    return event + shiny + casual;
  };

  io.socket.get("/user/get/" + $scope.refUser.name, function (data, res) {
    if (res.statusCode === 200) {
      $scope.refUser = data;
      if(!$scope.refUser.friendCodes || $scope.refUser.friendCodes.length === 0) {
        $scope.refUser.friendCodes = [""];
      }
      if($scope.refUser.games.length === 0) {
        $scope.refUser.games = [{tsv: "", ign: ""}];
      }
      window.document.title = data.name + "'s reference";
      $scope.$apply();
    }
  });

  $scope.addComment = function () {
    var comment = $scope.newStuff.newComment,
      url = "/reference/comment/add";

    if (!comment || comment === "") {
      return;
    }

    io.socket.post(url, {
      "refUser": $scope.refUser.id,
      "comment": comment
    }, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.comments.push(data);
        $scope.newStuff.newComment = "";
        $scope.$apply();
      }
      else {
        console.log("Error");
      }
    });
  };

  $scope.deleteComment = function (id, index) {
    var url = "/reference/comment/del";

    io.socket.post(url, {refUser: $scope.refUser.id, id: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.comments.splice(index, 1);
        $scope.$apply();
      } else {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

  $scope.modSaveProfile = function () {
    $scope.ok.modSaveProfile = false;
    $scope.spin.modSaveProfile = true;
    if (!$scope.user.isMod) {
      return;
    }
    var intro = $scope.refUser.intro,
      fcs = $scope.refUser.friendCodes.slice(0),
      games = $scope.refUser.games,
      url = "/user/edit";

    var patt = /\d{4}(-?)\d{4}\1\d{4}/;
    for (var fc in fcs) {
      if (!patt.test(fcs[fc])) {
        $scope.spin.modSaveProfile = false;
        $scope.modSaveError = "One of the friend codes wasn't in the correct format.";
        return;
      }
    }

    for (var game in games) {
      if (isNaN(games[game].tsv)) {
        $scope.spin.modSaveProfile = false;
        $scope.modSaveError = "One of the tsvs is not a number.";
        return;
      }
    }

    io.socket.post(url, {
      "userid": $scope.refUser.id,
      "intro": intro,
      "fcs": fcs,
      "games": games
    }, function (data, res) {
      $scope.spin.modSaveProfile = false;
      if (res.statusCode === 200) {
        $scope.ok.modSaveProfile = true;
        setTimeout(function () {
          $scope.ok.modSaveProfile = false;
          $scope.$apply();
        }, 1500);
      } else if (res.statusCode === 400) {
        $scope.modSaveError = "Your friend code was not correct.";
      } else if (res.statusCode === 500) {
        $scope.modSaveError = "There was some issue saving.";
      }
      $scope.$apply();
    });

  };

  $scope.addNote = function () {
    var newNote = $scope.newStuff.newNote,
      url = "/user/addNote";

    if (newNote) {
      io.socket.post(url, {
        "userid": $scope.refUser.id,
        "note": newNote
      }, function (data, res) {
        if (res.statusCode === 200) {
          $scope.refUser.modNotes.push(data);
          $scope.newStuff.newNote = "";
        } else {
          $scope.modSaveError = "There was some issue adding a note.";
        }
        $scope.$apply();
      });
    }
  };

  $scope.delNote = function (id) {
    var url = "/user/delNote";

    io.socket.post(url, {
      "userid": $scope.refUser.id,
      "id": id
    }, function (data, res) {
      if (res.statusCode === 200) {
        for (var note in $scope.refUser.modNotes) {
          if (id === $scope.refUser.modNotes[note].id) {
            $scope.refUser.modNotes.splice(note, 1);
            break;
          }
        }
      } else if (res.statusCode === 400) {
        $scope.modSaveError = "Your friend code was not correct.";
      } else if (res.statusCode === 500) {
        $scope.modSaveError = "There was some issue saving.";
      }
      $scope.$apply();
    });
  };

  $scope.approve = function (id, approve) {
    var url = "/reference/approve";

    io.socket.post(url, {
      userid: $scope.refUser.id,
      id: id,
      approve: approve
    }, function (data, res) {
      if (res.statusCode !== 200) {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

  $scope.approveAll = function (type) {
    var url = "/reference/approve/all";
    $scope.ok.approveAll[type] = false;
    $scope.spin.approveAll[type] = true;

    io.socket.post(url, {
      userid: $scope.refUser.id,
      type: type
    }, function (data, res) {
      if (res.statusCode !== 200) {
        console.log(res.statusCode + ": " + data);
      } else {
        $scope.ok.approveAll[type] = true;
        if (type === "event") {
          $scope.refUser.references = $filter("filter")($scope.refUser.references, {type: "!redemption"});
        }
        $scope.refUser.references = $filter("filter")($scope.refUser.references, {type: "!" + type});
        $scope.refUser.references = $scope.refUser.references.concat(data);
      }
      $scope.spin.approveAll[type] = false;
      $scope.$apply();
    });
  };

  $scope.banUser = function (ban) {
    var url = "/user/ban";

    io.socket.post(url, {userId: $scope.refUser.id, ban: ban}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.banned = data.banned;
        $scope.$apply();
      } else {
        console.log("Error");
      }
    });
  };

  $scope.deleteRef = function (id, index, type) {
    var url = "/reference/delete";
    io.socket.post(url, {refId: id, type: type}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.references = $filter("filter")($scope.refUser.references, {id: "!" + id});
        $scope.$apply();
      } else {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

}]);

fapp.controller("indexCtrl", ["$scope", "$filter", function ($scope, $filter) {
  $scope.refUrl = "";
  $scope.user2 = "";
  $scope.gave = "";
  $scope.got = "";
  $scope.type = "";
  $scope.descrip = "";
  $scope.selectedRef = {};
  $scope.referenceToRevert = {};

  $scope.addRefError = "";
  $scope.editRefError = "";
  $scope.indexOk = {};
  $scope.indexSpin = {};

  $scope.focus = {
    gavegot: false
  };

  $scope.isFocused = function () {
    return $scope.focus.gavegot || $scope.got || $scope.gave;
  };


  $scope.editReference = function (ref) {
    $scope.selectedRef = ref;
    $scope.referenceToRevert = $.extend(true, {}, ref);
  };

  $scope.revertRef = function () {
    var index = $scope.user.references.indexOf($scope.selectedRef);
    $scope.user.references[index] = $.extend(true, {}, $scope.referenceToRevert);
  };

  $scope.editRef = function () {
    $scope.editRefError = "";
    $scope.indexOk.editRef = false;
    var ref = $scope.selectedRef,
      url = "/reference/edit",
      regexp = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((pokemontrades)|(SVExchange)|(poketradereferences))\/comments\/([a-z\d]*)\/([^\/]+)\/([a-z\d]+)(\?[a-z\d]+)?/,
      regexpGive = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((SVExchange)|(poketradereferences)|(Pokemongiveaway)|(SVgiveaway))\/comments\/([a-z\d]*)\/([^\/]+)\/?/,
      regexpMisc = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com.*/,
      regexpUser = /^(\/u\/)?[A-Za-z0-9_\-]*$/;

    if (!ref.type) {
      $scope.editRefError = "Please choose a type.";
      return;
    }
    if (ref.type === "egg" || ref.type === "giveaway" || ref.type === "misc") {
      if (!ref.description) {
        $scope.editRefError = "Make sure you enter all the information";
        return;
      }
    } else {
      if (!ref.got || !ref.gave) {
        $scope.editRefError = "Make sure you enter all the information";
        return;
      }
    }
    if (!ref.url ||
      ((ref.type !== "giveaway" && ref.type !== "misc") && !ref.user2)) {
      $scope.editRefError = "Make sure you enter all the information";
      return;
    }
    if ((ref.type === "giveaway" && !regexpGive.test(ref.url)) ||
      (ref.type !== "giveaway" && ref.type !== "misc" &&
        !regexp.test(ref.url)) ||
      (ref.type === "misc" && !regexpMisc.test(ref.url))) {
      $scope.editRefError = "Looks like you didn't input a proper permalink";
      return;
    }

    if (ref.user2.indexOf("/u/") === -1) {
      ref.user2 = "/u/" + ref.user2;
    }

    if (user2 === ("/u/" + $scope.user.name)) {
      $scope.addRefError = "Don't put your own username there.";
      return;
    }

    if(($scope.type !== "giveaway" && $scope.type !== "misc") && !regexpUser.test(user2)) {
      $scope.addRefError = "Please put a username on it's own, or in format: /u/username. Not the full url, or anything else.";
      return;
    }

    $scope.indexSpin.editRef = true;
    io.socket.post(url, ref, function (data, res) {
      $scope.indexSpin.editRef = false;
      if (res.statusCode !== 200) {
        $scope.editRefError = "There was an issue.";
        console.log(res);
      } else {
        $scope.indexOk.editRef = true;
      }
      $scope.$apply();
    });

  };

  $scope.isEvent = function (el) {
    return el.type === "event" || el.type === "redemption";
  };

  $scope.isShiny = function (el) {
    return el.type === "shiny";
  };

  $scope.isCasual = function (el) {
    return el.type === "casual";
  };

  $scope.numberOfTrades = function () {
    if (!$scope.user || !$scope.user.references) {
      return 0;
    }
    var refs = $scope.user.references;
    var event = $filter("filter")(refs, $scope.isEvent).length;
    var shiny = $filter("filter")(refs, $scope.isShiny).length;
    var casual = $filter("filter")(refs, $scope.isCasual).length;
    return event + shiny + casual;
  };

  $scope.addReference = function () {
    $scope.addRefError = "";
    var url = "/reference/add",
      user2 = $scope.user2,
      regexp = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((pokemontrades)|(SVExchange)|(poketradereferences))\/comments\/([a-z\d]*)\/([^\/]+)\/([a-z\d]+)(\?[a-z\d]+)?/,
      regexpGive = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((SVExchange)|(poketradereferences)|(Pokemongiveaway)|(SVgiveaway))\/comments\/([a-z\d]*)\/([^\/]+)\/?/,
      regexpMisc = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com.*/,
      regexpUser = /^(\/u\/)?[A-Za-z0-9_\-]*$/;

    if (!$scope.type) {
      $scope.addRefError = "Please choose a type.";
      return;
    }
    if ($scope.type === "egg" || $scope.type === "giveaway" || $scope.type === "misc") {
      if (!$scope.descrip) {
        $scope.addRefError = "Make sure you enter all the information";
        return;
      }
    } else {
      if (!$scope.got || !$scope.gave) {
        $scope.addRefError = "Make sure you enter all the information";
        return;
      }
    }
    if (!$scope.refUrl ||
      (($scope.type !== "giveaway" && $scope.type !== "misc") && !$scope.user2)) {
      $scope.addRefError = "Make sure you enter all the information";
      return;
    }
    if (($scope.type === "giveaway" && !regexpGive.test($scope.refUrl)) ||
      ($scope.type !== "giveaway" && $scope.type !== "misc" &&
        !regexp.test($scope.refUrl)) ||
      ($scope.type === "misc" && !regexpMisc.test($scope.refUrl))) {
      $scope.addRefError = "Looks like you didn't input a proper permalink";
      return;
    }

    if (user2.indexOf("/u/") === -1) {
      user2 = "/u/" + user2;
    }

    if (user2 === ("/u/" + $scope.user.name)) {
      $scope.addRefError = "Don't put your own username there.";
      return;
    }

    if(($scope.type !== "giveaway" && $scope.type !== "misc") && !regexpUser.test(user2)) {
      $scope.addRefError = "Please put a username on it's own, or in format: /u/username. Not the full url, or anything else.";
      return;
    }

    var post = {
      "userid": $scope.user.id,
      "url": $scope.refUrl,
      "user2": user2,
      "type": $scope.type,
      "notes": $scope.notes
    };

    if ($scope.type === "egg" || $scope.type === "giveaway" || $scope.type === "misc") {
      post.descrip = $scope.descrip;
    } else {
      post.got = $scope.got;
      post.gave = $scope.gave;
    }

    io.socket.post(url, post, function (data, res) {
      console.log(res);
      if (res.statusCode === 200) {
        $scope.refUrl = "";
        $scope.descrip = "";
        $scope.got = "";
        $scope.gave = "";
        $scope.user2 = "";
        $scope.notes = "";
        $scope.user.references.push(data);

        if (data.type === "redemption") {
          $('#collapseevents').prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapseevents').prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
          $scope.$apply();
        } else if (data.type === "shiny") {
          $('#collapseshinies').prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapseshinies').prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
          $scope.$apply();
        } else {
          $('#collapse' + $scope.type + "s").prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapse' + $scope.type + "s").prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
          $scope.$apply();
        }
      } else {
        $scope.addRefError = "Already added that URL.";
        $scope.$apply();
      }
    });

  };

  $scope.deleteRef = function (id, ref, type) {
    var url = "/reference/delete";
    io.socket.post(url, {refId: id, type: type}, function (data, res) {
      if (res.statusCode === 200) {
        var index = $scope.user.references.indexOf(ref);
        $scope.user.references.splice(index, 1);
        $scope.$apply();
      } else {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

}]);

fapp.controller("userCtrl", ['$scope', "$filter", function ($scope, $filter) {
  $scope.scope = $scope;
  $scope.user = undefined;
  $scope.flairs = {};
  $scope.selectedTradeFlair = undefined;
  $scope.selectedExchFlair = undefined;
  $scope.loaded = false;
  $scope.userok = {};
  $scope.errors = {};
  $scope.userspin = {};
  $scope.flairNames = [
    {name: "pokeball"},
    {name: "greatball"},
    {name: "ultraball"},
    {name: "masterball"},
    {name: "cherishball"},
    {name: "gsball"},
    {name: "default"},
    {name: "premierball"},
    {name: "safariball"},
    {name: "luxuryball"},
    {name: "dreamball"},
    {name: "ovalcharm"},
    {name: "shinycharm"},
    {name: "egg"},
    {name: "eevee"},
    {name: "togepi"},
    {name: "manaphy"},
  ];
  $scope.subNames = [
    {name: "pokemontrades", view: "Pokemon Trades"},
    {name: "svexchange", view: "SV Exchange"}
  ];

  $scope.isApproved = function (el) {
    return el.approved;
  };

  $scope.isEvent = function (el) {
    return el.type === "event" || el.type === "redemption";
  };

  $scope.isShiny = function (el) {
    return el.type === "shiny";
  };

  $scope.isCasual = function (el) {
    return el.type === "casual";
  };

  $scope.isEgg = function (el) {
    return el.type === "egg";
  };

  $scope.isBank = function (el) {
    return el.type === "bank";
  };

  $scope.isGiveaway = function (el) {
    return el.type === "giveaway";
  };

  $scope.isMisc = function (el) {
    return el.type === "misc";
  };

  $scope.formattedName = function (name) {
    if (!name) {
      return "";
    }
    var formatted = "";
    if (name.indexOf("ball") > -1) {
      formatted += name.charAt(0).toUpperCase();
      formatted += name.slice(1, -4);
      formatted += " Ball";
    } else if (name.indexOf("charm") > -1) {
      formatted += name.charAt(0).toUpperCase();
      formatted += name.slice(1, -5);
      formatted += " Charm";
    } else {
      formatted += name.charAt(0).toUpperCase();
      formatted += name.slice(1);
      formatted += " Egg";
    }
    return formatted;
  };

  $scope.getName = function (id) {
    var name;
    $scope.flairs.forEach(function (flair) {
      if (flair.id === id) {
        name = $scope.formattedName(flair.name);
      }
    });
    return name;
  };

  $scope.canApplyForAFlair = function () {
    return (($scope.selectedTradeFlair &&
        $scope.user.flair.ptrades.flair_css_class !== $scope.selectedTradeFlair) ||
    ($scope.selectedExchFlair &&
        $scope.user.flair.svex.flair_css_class !== $scope.selectedExchFlair));
  };

  $scope.applyFlair = function () {
    var done = 0;
    $scope.errors.flairApp = "";
    $scope.userok.applyFlair = false;
    $scope.userspin.applyFlair = true;
    if ($scope.selectedTradeFlair &&
      $scope.user.flair.ptrades.flair_css_class !== $scope.selectedTradeFlair) {
      io.socket.post("/flair/apply", {
        flair: $scope.selectedTradeFlair,
        sub: "pokemontrades"
      }, function (data, res) {
        if (res.statusCode === 200) {
          if (done) {
            $scope.selectedTradeFlair = undefined;
            $scope.userok.applyFlair = true;
            $scope.userspin.applyFlair = false;
            $scope.$apply();
          } else {
            done++;
          }
        } else if (res.statusCode === 400) {
          $scope.errors.flairApp = "You have already applied for that flair.";
          $scope.userspin.applyFlair = false;
          $scope.$apply();
        } else {
          $scope.errors.flairApp = "Something unexpected happened.";
          $scope.userspin.applyFlair = false;
          $scope.$apply();
          console.log(data);
        }
      });
    } else {
      done++;
    }
    if ($scope.selectedExchFlair &&
      $scope.user.flair.svex.flair_css_class !== $scope.selectedExchFlair) {
      io.socket.post("/flair/apply", {
        flair: $scope.selectedExchFlair,
        sub: "svexchange"
      }, function (data, res) {
        if (res.statusCode === 200) {
          if (done) {
            $scope.userok.applyFlair = true;
            $scope.userspin.applyFlair = false;
            $scope.selectedExchFlair = undefined;
            $scope.$apply();
          } else {
            done++;
          }
        } else {
          console.log(data);
        }
      });
    } else {
      done++;
    }

    if (done === 2) {
      $scope.userspin.applyFlair = false;
    }
  };

  $scope.setSelectedTradeFlair = function (id, bool) {
    if (bool) {
      $scope.selectedTradeFlair = id;
    }
  };

  $scope.setSelectedExchFlair = function (id, bool) {
    if (bool) {
      $scope.selectedExchFlair = id;
    }
  };

  $scope.inPokemonTradesCasual = function (flair) {
    return flair.sub === "pokemontrades" && !flair.events && !flair.shinyevents;
  };

  $scope.inPokemonTradesCollector = function (flair) {
    return flair.sub === "pokemontrades" && (flair.events > 0 || flair.shinyevents > 0);
  };

  $scope.inSVExchange = function (flair) {
    return flair.sub === "svexchange";
  };

  $scope.getRedditUser = function (username) {
    if (username && username.indexOf("/u/") === -1) {
      return "/u/" + username;
    } else {
      return username;
    }
  };

  io.socket.get("/user/mine", function (data, res) {
    if (res.statusCode === 200) {
      $scope.user = data;
      if (!$scope.user.friendCodes) {
        $scope.user.friendCodes = [""];
      }
      if (!$scope.user.games.length) {
        $scope.user.games = [{tsv: "", ign: ""}];
      }

      $scope.getReferences();
      $scope.$apply();
    } else {
      $scope.loaded = true;
      $scope.$apply();
      if (window.location.hash === "#/comments") {
        $('#tabList li:eq(1) a').tab('show');
      } else if (window.location.hash === "#/info") {
        $('#tabList li:eq(2) a').tab('show');
      } else if (window.location.hash === "#/modEdit") {
        $('#tabList li:eq(3) a').tab('show');
      }
    }
  });

  $scope.getReferences = function () {
    if ($scope.user) {
      io.socket.get("/user/get/" + $scope.user.name, function (data, res) {
        if (res.statusCode === 200) {
          $scope.user = data;
          if ($scope.user.flair && $scope.user.flair.ptrades) {
            for (var flairId in $scope.flairs) {
              var flair = $scope.flairs[flairId];
              if (flair.name === $scope.user.flair.ptrades.flair_css_class) {
                $scope.selectedTradeFlair = flair.name;
              }
              if (flair.name === $scope.user.flair.svex.flair_css_class) {
                $scope.selectedExchFlair = flair.name;
              }
            }
          }
          if (!$scope.user.friendCodes || !$scope.user.friendCodes.length) {
            $scope.user.friendCodes = [""];
          }
          if (!$scope.user.games || !$scope.user.games.length) {
            $scope.user.games = [{tsv: "", ign: ""}];
          }
        }
        $scope.$apply();
        $scope.loaded = true;
        $scope.$apply();
        if (window.location.hash === "#/comments") {
          $('#tabList li:eq(1) a').tab('show');
        } else if (window.location.hash === "#/info") {
          $('#tabList li:eq(2) a').tab('show');
        } else if (window.location.hash === "#/modEdit") {
          $('#tabList li:eq(3) a').tab('show');
        }
      });
    } else {
      window.setTimeout($scope.getReferences, 1000);
    }
  };

  $scope.canUserApply = function (flair) {
    if (!$scope.user || !$scope.user.references) {
      return false;
    }
    var refs = $scope.user.references,
        trades = flair.trades || 0,
        shinyevents = flair.shinyevents || 0,
        events = flair.events || 0,
        eggs = flair.eggs || 0,
        userevent = $filter("filter")(refs, $scope.isEvent).length,
        usershiny = $filter("filter")(refs, $scope.isShiny).length,
        usercasual = $filter("filter")(refs, $scope.isCasual).length,
        userEgg = $filter("filter")(refs, $scope.isEgg).length,
        usershinyevents = userevent + usershiny,
        userTrades = usershinyevents + usercasual,
        userFlair = {};

    for(var i = 0; i < $scope.flairs.length; i++) {
      if ($scope.flairs[i].name === $scope.user.flair.ptrades.flair_css_class) {
        userFlair = $scope.flairs[i];
      }
    }

    if (flair === userFlair) {
      return false;
    }

    if ($scope.inPokemonTradesCasual(flair) && $scope.inPokemonTradesCollector(userFlair)) {
      return false;
    }

    if (userFlair.trades > trades &&
        userFlair.shinyevents > shinyevents &&
        userFlair.events > events) {
      return false;
    }

    return (userTrades >= trades &&
      usershinyevents >= shinyevents &&
      userevent >= events &&
      userEgg >= eggs);
  };

  $scope.addFc = function () {
    $scope.user.friendCodes.push("");
  };

  $scope.delFc = function (index) {
    $scope.user.friendCodes.splice(index, 1);
  };

  $scope.addGame = function () {
    $scope.user.games.push({tsv: "", ign: ""});
  };

  $scope.delGame = function (game) {
    var index = $scope.user.games.indexOf(game);
    $scope.user.games.splice(index, 1);
  };

  $scope.saveProfile = function () {
    $scope.userok.saveProfile = false;
    $scope.userspin.saveProfile = true;
    var intro = $scope.user.intro,
      fcs = $scope.user.friendCodes.slice(0),
      games = $scope.user.games,
      url = "/user/edit";
    var len = fcs.length;
    while (len--) {
      if (fcs[len] === "") {
        fcs.splice(len, 1);
      }
    }

    var patt = /([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
    for (var fc in fcs) {
      if (!patt.test(fcs[fc])) {
        $scope.userspin.saveProfile = false;
        $("#saveError").html("One of your friend codes wasn't in the correct format.").show();
        return;
      }
    }

    for (var game in games) {
      if (isNaN(games[game].tsv)) {
        $scope.userspin.saveProfile = false;
        $("#saveError").html("One of the tsvs is not a number.").show();
        return;
      }
      if (games[game].tsv === "") {
        games[game].tsv = 0;
      }
    }

    io.socket.post(url, {
      "userid": $scope.user.id,
      "intro": intro,
      "fcs": fcs,
      "games": games
    }, function (data, res) {
      if (res.statusCode === 200) {
        $scope.userok.saveProfile = true;
      } else if (res.statusCode === 400) {
        $("#saveError").html("There was some issue.").show();
        console.log(data);
      } else if (res.statusCode === 500) {
        $("#saveError").html("There was some issue saving.").show();
      }
      $scope.userspin.saveProfile = false;
      $scope.$apply();
    });

  };

  $scope.getFlairs = function () {
    var url = "/flair/all";

    io.socket.get(url, function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairs = data;
        if (data.length === 0) {
          $scope.flairs[0] = {
            name: "",
            trades: "",
            shinyevents: "",
            eggs: "",
            sub: ""
          };
        }
      }
    });
  };

  $scope.addFlair = function () {
    $scope.flairs.push({});
  };

  $scope.saveFlairs = function () {
    var url = "/flair/save";

    io.socket.post(url, {flairs: $scope.flairs}, function (data, res) {
      if (res.statusCode === 200) {
        console.log(data);
      } else {
        console.log(res);
      }
    });
  };

  $scope.getFlairs();
}]);

fapp.controller("adminCtrl", ['$scope', function ($scope) {
  $scope.users = [];
  $scope.flairApps = [];
  $scope.flairAppError = "";
  $scope.adminok = {
    appFlair: {}
  };
  $scope.adminspin = {
    appFlair: {}
  };

  $scope.getFlairApps = function () {
    io.socket.get("/flair/apps/all", function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairApps = data;
        $scope.$apply();
      }
    });
  };

  $scope.getBannedUsers = function () {
    io.socket.get("/user/banned", function (data, res) {
      if (res.statusCode === 200) {
        $scope.users = data;
        $scope.$apply();
      }
    });
  };

  $scope.banUser = function (user, ban) {
    var url = "/user/ban";

    io.socket.post(url, {userId: user.id, ban: ban}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.getBannedUsers();
        $scope.$apply();
      } else {
        console.log("Error");
      }
    });
  };

  $scope.denyApp = function (id, $index) {
    var url = "/flair/app/deny";
    $scope.flairAppError = "";

    io.socket.post(url, {id: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairApps.splice($index, 1);
        $scope.$apply();
      } else {
        $scope.flairAppError = "Couldn't deny, for some reason.";
        $scope.$apply();
        console.log(data);
      }
    });
  };

  $scope.approveApp = function (id, $index) {
    $scope.adminok.appFlair[$index] = false;
    $scope.adminspin.appFlair[$index] = true;
    $scope.flairAppError = "";
    var url = "/flair/app/approve";

    io.socket.post(url, {id: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairApps.splice($index, 1);
        $scope.adminok.appFlair[$index] = true;
      } else {
        $scope.flairAppError = "Couldn't approve, for some reason.";
        console.log(data);
      }
      $scope.adminspin.appFlair[$index] = false;
      $scope.$apply();
    });
  };

  $scope.getBannedUsers();
  $scope.getFlairApps();
}]);

angular.module('ngReallyClickModule', ['ui.bootstrap'])
  .directive('ngReallyClick', ['$modal',
    function($modal) {

      var ModalInstanceCtrl = function($scope, $modalInstance) {
        $scope.ok = function() {
          $modalInstance.close();
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      };

      return {
        restrict: 'A',
        scope: {
          ngReallyClick:"&"
        },
        link: function(scope, element, attrs) {
          element.bind('click', function() {
            var user = attrs.ngReallyUser;
            var flair = attrs.ngReallyFlair;
            var switchInfo = attrs.ngReallySwitch;
            var modalHtml = "";
            var deleteHtml = '<div class="modal-body">' +
                'Are you sure you wish to delete this reference?' +
                '</div>';
            var denyHtml = '<div class="modal-body">' +
                'Are you sure you wish to deny this application?' +
                '</div>';
            var defaultHtml ='<div class="modal-body">Are you sure you want ' +
              'to give <strong>' + user + '</strong> the <strong>' +
              flair + '</strong> flair?</div>';

            switch (switchInfo) {
              case "deleteRef":
                modalHtml = deleteHtml;
                break;
              case "denyApp":
                modalHtml = denyHtml;
                break;
              default:
                modalHtml = defaultHtml;
                break;
            }

            modalHtml += '<div class="modal-footer">' +
            '<button class="btn btn-primary" ng-click="ok()">Yes</button>' +
            '<button class="btn btn-default" ng-click="cancel()">No</button>' +
            '</div>';

            var modalInstance = $modal.open({
              template: modalHtml,
              controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function() {
              scope.ngReallyClick();
            }, function() {
              //Modal dismissed
            });

          });

        }
      };
    }
  ]);

angular.module('numberPadding', []).filter('numberFixedLen', function () {
  return function (n, len) {
    var num = parseInt(n, 10);
    len = parseInt(len, 10);
    if (isNaN(num) || isNaN(len)) {
      return n;
    }
    num = ''+num;
    while (num.length < len) {
      num = '0'+num;
    }
    return num;
  };
});

$(function() { $("[data-toggle='collapse']").click(function() {}); });
