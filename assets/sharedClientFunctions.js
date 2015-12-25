var referenceService = require('../api/services/References.js');
var flairService = require('../api/services/Flairs.js');
var _ = require('lodash');
module.exports = {
  addRepeats: function ($scope, io) {
    var pathToRefs = 'refUser.references',
      pathToApps = 'refUser.apps';
    $scope.editRef = function () {
      var url = "/reference/edit";
      try {
        $scope.validateRef($scope.selectedRef);
      } catch (err) {
        $scope.editRefError = err;
        return;
      }
      $scope.indexSpin.editRef = true;
      io.socket.post(url, $scope.selectedRef, function (data, res) {
        $scope.indexSpin.editRef = false;
        if (res.statusCode === 200) {
          $scope.indexOk.editRef = true;
          var index = $scope.refUser.references.findIndex(function (searchRef) {
            return searchRef.id === $scope.selectedRef.id;
          });
          $scope.refUser.references[index] = $scope.selectedRef;
        } else {
          $scope.editRefError = "There was an issue.";
          console.log(res);
        }
        $scope.$apply();
      });
    };
    $scope.setLocalBan = function (username, ban) {
      var url = "/mod/setlocalban";
      io.socket.post(url, {username: username, ban: ban}, function (data, res) {
        if (res.statusCode === 200) {
          if ($scope.refUser) {
            $scope.refUser.banned = data.banned;
          } else {
            $scope.getBannedUsers();
          }
          $scope.$apply();
        } else {
          console.log("Error banning " + username + ": " + res.statusCode);
        }
      });
    };
    $scope.deleteRef = function (id) {
      var url = "/reference/delete";
      io.socket.post(url, {id: id}, function (data, res) {
        if (res.statusCode === 200) {
          $scope.refUser.references = $scope.refUser.references.filter(function (ref) {
            return ref.id !== id;
          });
          $scope.$apply();
        } else {
          console.log(res.statusCode + ": " + data);
        }
      });
    };
    $scope.isNotNormalTrade = referenceService.isNotNormalTrade;
    $scope.hasNumber = referenceService.hasNumber;
    $scope.isEvent = referenceService.isEvent;
    $scope.isShiny = referenceService.isShiny;
    $scope.isCasual = referenceService.isCasual;
    $scope.isEggCheck = referenceService.isEggCheck;
    $scope.isTrade = referenceService.isTrade;
    $scope.isInvolvement = referenceService.isInvolvement;
    $scope.isEgg = referenceService.isEgg;
    $scope.isBank = referenceService.isBank;
    $scope.isGiveaway = referenceService.isGiveaway;
    $scope.isEggCheck = referenceService.isEggCheck;
    $scope.isMisc = referenceService.isMisc;
    $scope.isApprovable = referenceService.isApprovable;
    $scope.isApproved = referenceService.isApproved;
    $scope.getRedditUser = referenceService.getRedditUser;
    $scope.formattedName = flairService.formattedName;
    $scope.inPokemonTradesTrader = flairService.inPokemonTradesTrader;
    $scope.inPokemonTradesHelper = flairService.inPokemonTradesHelper;
    $scope.inSVExchangeHatcher = flairService.inSVExchangeHatcher;
    $scope.inSVExchangeGiver = flairService.inSVExchangeGiver;
    $scope.getFlair = flairService.getFlair;
    $scope.flairCheck = flairService.flairCheck;
    $scope.validateRef = referenceService.validateRef;
    $scope.userHasFlair = function (flair) {
      return flairService.userHasFlair($scope.user, flair);
    };
    $scope.numberOfTrades = function () {
      return referenceService.numberOfTrades(_.get($scope, pathToRefs));
    };
    $scope.numberOfPokemonGivenAway = function () {
      return referenceService.numberOfPokemonGivenAway(_.get($scope, pathToRefs));
    };
    $scope.numberOfEggsGivenAway = function () {
      return referenceService.numberOfEggsGivenAway(_.get($scope, pathToRefs));
    };
    $scope.numberOfEggChecks = function () {
      return referenceService.numberOfEggChecks(_.get($scope, pathToRefs));
    };
    $scope.numberOfApprovedEggChecks = function () {
      return referenceService.numberOfApprovedEggChecks(_.get($scope, pathToRefs));
    };
    $scope.getFlairTextForSVEx = function () {
      return flairService.getFlairTextForSVEx($scope.refUser);
    };
    $scope.applied = function (flair) {
      return flairService.applied(_.get($scope, pathToApps), flair);
    };
    $scope.canUserApply = function (applicationFlair) {
      if (!$scope.refUser || !$scope.user || $scope.user.name !== $scope.refUser.name) {
        return false;
      }
      return flairService.canUserApply(
        $scope.refUser.references,
        applicationFlair,
        flairService.getUserFlairs($scope.user, $scope.flairs)
      ) && !$scope.applied(applicationFlair, $scope.flairs);
    };
    $scope.formattedRequirements = function (flair) {
      return flairService.formattedRequirements(flair, $scope.flairs);
    };
    $scope.clickRefLink = function (ref) {
      if ($scope.user.isMod) {
        io.socket.post('/flair/app/refreshClaim', ref, function (data, res) {
          if (res.statusCode !== 200) {
            console.log('Error ' + res.statusCode + ': Could not send link data to server.');
          }
        });
      }
    };
  }
};