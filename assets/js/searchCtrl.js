var socket = require("socket.io-client");
var io = require("sails.io.js")(socket);
var _ = require("lodash");
var $ = require("jquery");

module.exports = function ($scope, $timeout) {

  $scope.searchInfo = {
    keyword: "",
    category: [],
    user: "",
    searches: [{long: "ref", short: "s", name: "References"},
      {long: "log", short: "l", name: "Logs"}]
  };
  $scope.searchInfo.search = $scope.searchInfo.searches[0];

  $scope.setSearch = function (long) {
    $scope.searchInfo.search = _.find($scope.searchInfo.searches, function (item) {
      return item.long === long;
    });
  };
  $scope.searchInfo.uriKeyword = function () {
    return encodeURIComponent($scope.searchInfo.keyword.replace(/\//g, "%2F"));
  };
  $scope.searching = false;
  $scope.searchResults = [];
  $scope.searchedFor = "";
  $scope.lastSearch = "";
  $scope.numberSearched = 0;

  $scope.toggleCategory = function (name) {
    var index = $scope.searchInfo.category.indexOf(name);

    if (index > -1) {
      $scope.searchInfo.category.splice(index, 1);
    } else {
      $scope.searchInfo.category.push(name);
    }

    if ($scope.searchInfo.keyword) {
      $scope.search();
    }
  };

  $scope.getMore = function () {
    if ($scope.searching) {
      return;
    }
    $scope.numberSearched += 20;
    $scope.search($scope.numberSearched);
  };

  $scope.search = function (skip) {
    $('.search-results').show();
    $scope.searching = true;
    if (!$scope.searchInfo.keyword) {
      $scope.searching = false;
      $scope.searchResults = [];
      $scope.numberSearched = 0;
      return;
    }

    if (!skip) {
      $scope.numberSearched = 0;
      skip = 0;
    }

    var url = "/search/" + $scope.searchInfo.search.long;
    url += "?keyword=" + $scope.searchInfo.keyword;
    if ($scope.searchInfo.category.length > 0) {
      url += "&categories=" + $scope.searchInfo.category;
    }
    if ($scope.searchInfo.user) {
      url += "&user=" + $scope.searchInfo.user;
    }
    url += "&skip=" + skip;

    $scope.searchedFor = url;
    io.socket.get(url, function (data, res) {
      if (res.statusCode === 200 && $scope.searchedFor === url) {
        if (skip) {
          $scope.searchResults = $scope.searchResults.concat(data);
        } else {
          $scope.searchResults = data;
        }
        for (var i = 0; i < $scope.searchResults.length; i++) {
          //Otherwise the date ends up in a messy format like 2015-01-01T00:00:00.000Z
          $scope.searchResults[i].createdAt = $scope.searchResults[i].createdAt.replace("T", " ").replace(/\.\d*Z/, " UTC");
        }
        $scope.searching = false;
        $scope.$apply();
      } else if (res.statusCode !== 200) {
        // Some error
        console.log(res);
      }
    });
  };

  var searchTimeout;
  $scope.searchMaybe = function () {
    if (searchTimeout) {
      $timeout.cancel(searchTimeout);
    }

    searchTimeout = $timeout(function () {
      if (!_.isEqual($scope.lastSearch, $scope.searchInfo)) {
        $scope.lastSearch = _.cloneDeep($scope.searchInfo);
        $scope.search();
        console.log("searching " + $scope.searchInfo);
      }
    }, 500);
  };

  $scope.submit = function () {
    window.location.href = "/search/" + $scope.searchInfo.search.short + "/" + $scope.searchInfo.uriKeyword();
  };

  $timeout(function () {
    if ($scope.searchInfo.keyword) {
      $scope.search();
    }
  }, 300);
  $scope.getFlairs();
};
