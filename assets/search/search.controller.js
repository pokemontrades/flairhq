var socket = require("socket.io-client");
var io = require("sails.io.js")(socket);
var _ = require("lodash");
var $ = require("jquery");

module.exports = function ($scope, $timeout) {
  var vm = this;

  vm.user = $scope.user;
  vm.potentialSearches = require("./types.js");
  vm.input = {
    keyword: "",
    category: [],
    user: "",
    search: "",
    uriKeyword: uriKeyword
  };
  vm.inProgress = false;
  vm.done = false;
  vm.results = [];

  vm.getSearch = getSearch;
  vm.toggleCategory = toggleCategory;
  vm.changeSearchType = changeSearchType;
  vm.searchMaybe = searchMaybe;
  vm.getMore = getMore;
  vm.searchesForUser = searchesForUser;
  vm.submit = submit;
  vm.linkAddress = linkAddress;
  vm.searchedFor = '';

  ////////////////////////////////

  vm.numberSearched = 0;
  var lastSearch;

  $timeout(function () {
    if (vm.input.keyword && vm.input.search) {
      search();
    }
  }, 300);

  if (!vm.input.search) {
    vm.input.search = 'ref';
  }

  function linkAddress (result) {
    if (vm.input.search === 'ref') {
      return result.url;
    } else if (vm.input.search === 'user') {
      return '/u/' + result._id;
    } else if (vm.input.search === 'modmail') {
      return 'https://reddit.com/message/messages/' + result.name.substring(3);
    }
  }

  function searchesForUser() {
    return _.filter(vm.potentialSearches, userAllowedSearch);
  }

  function userAllowedSearch(search) {
    // Either all users can access, or only mods
    return vm.user.modPermissions && vm.user.modPermissions.includes('all') || !search.modOnly;
  }

  function getSearch() {
    return _.find(vm.potentialSearches, function (item) {
      return item.short === vm.input.search;
    });
  }

  function uriKeyword() {
    return encodeURIComponent(vm.input.keyword.replace(/\//g, "%2F"));
  }

  function changeSearchType () {
    //Clear the existing results since they're no longer relevant
    vm.results = [];
    if (vm.input.keyword) {
      search();
    }
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
    vm.done = false;
    vm.searchedFor = url;
    io.socket.get(url, function (data, res) {
      if (res.statusCode === 200 && vm.searchedFor === url) {
        if (skip) {
          vm.results = vm.results.concat(data);
        } else {
          vm.results = data;
        }
        vm.done = !data.length;
        vm.inProgress = false;
        $scope.$apply();
      } else if (res.statusCode !== 200) {
        // Some error
        console.log(res);
      }
    });
  }
};
