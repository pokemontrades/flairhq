var socket = require("socket.io-client");
var io = require("sails.io.js")(socket);
var _ = require("lodash");
var $ = require("jquery");

module.exports = function ($scope, $timeout, UserFactory) {
  var vm = this;

  vm.user = {};
  vm.potentialSearches = require("./types.js");
  vm.input = {
    keyword: "",
    category: [],
    user: "",
    search: "",
    uriKeyword: uriKeyword
  };
  vm.inProgress = false;
  vm.results = [];

  vm.getSearch = getSearch;
  vm.toggleCategory = toggleCategory;
  vm.searchMaybe = searchMaybe;
  vm.getMore = getMore;
  vm.searchesForUser = searchesForUser;
  vm.submit = submit;
  vm.linkAddress = linkAddress;

  ////////////////////////////////

  vm.numberSearched = 0;
  var lastSearch;

  $timeout(function () {
    if (vm.input.keyword) {
      search();
    }
  }, 300);

  $scope.$watch(
    UserFactory.getUser,
    function (newU, oldU) {
      if (newU !== oldU) {
        vm.user = UserFactory.getUser();
        if (!$scope.onSearchPage) {
          vm.input.search = "ref";
        }
      }
    }
  );

  function linkAddress (result) {
    if (vm.input.search === 'ref') {
      return '/u/' + result.user;
    } else if (vm.input.search === 'user') {
      return '/u/' + result.name;
    }
  }

  function searchesForUser() {
    return _.filter(vm.potentialSearches, userAllowedSearch);
  }

  function userAllowedSearch(search) {
    // Either all users can access, or only mods
    if (!search.modOnly) {
      return true;
    } else {
      return vm.user.isMod;
    }
  }

  function getSearch() {
    return _.find(vm.potentialSearches, function (item) {
      return item.short === vm.input.search;
    });
  }

  function uriKeyword() {
    return encodeURIComponent(vm.input.keyword.replace(/\//g, "%2F"));
  }

  function toggleCategory(name) {
    var index = vm.input.category.indexOf(name);

    if (index > -1) {
      vm.input.category.splice(index, 1);
    } else {
      vm.input.category.push(name);
    }

    if (vm.input.keyword) {
      search();
    }
  }

  function getMore() {
    if (vm.inProgress) {
      return;
    }
    vm.numberSearched += 20;
    search(vm.numberSearched);
  }

  var searchTimeout;
  function searchMaybe() {
    if (searchTimeout) {
      $timeout.cancel(searchTimeout);
    }

    searchTimeout = $timeout(function () {
      if (!_.isEqual(lastSearch, vm.input)) {
        lastSearch = _.cloneDeep(vm.input);
        search();
      }
    }, 500);
  }

  function submit() {
    if (vm.input.keyword) {
      window.location.href = "/search/" + vm.getSearch().short + "/" + vm.input.uriKeyword();
    }
  }

  function search(skip) {
    console.log("Searching");
    $('.search-results').show();
    vm.inProgress = true;
    if (!vm.input.keyword) {
      vm.inProgress = false;
      vm.results = [];
      vm.numberSearched = 0;
      return;
    }

    if (!skip) {
      vm.numberSearched = 0;
      skip = 0;
    }

    var url = "/search/" + vm.getSearch().short;
    url += "?keyword=" + vm.input.keyword;
    if (vm.input.category.length > 0) {
      url += "&categories=" + vm.input.category;
    }
    if (vm.input.user) {
      url += "&user=" + vm.input.user;
    }
    url += "&skip=" + skip;

    var searchedFor = url;
    io.socket.get(url, function (data, res) {
      if (res.statusCode === 200 && searchedFor === url) {
        if (skip) {
          vm.results = vm.results.concat(data);
        } else {
          vm.results = data;
        }
        vm.inProgress = false;
        $scope.$apply();
      } else if (res.statusCode !== 200) {
        // Some error
        console.log(res);
      }
    });
  }
};
