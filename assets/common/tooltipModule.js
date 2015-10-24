var ng = require("angular");
var $ = require('jquery');

ng.module("tooltipModule", []).directive("ngTooltip", function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      title: '@title',
      label: '@label'
    },
    templateUrl: '/common/tooltipView.html',
    transclude: true,
    link: function (scope, element, attrs) {
      var thisElement = $(element[0]).find('[data-toggle=tooltip]');
      thisElement.tooltip({
        html: true,
        trigger: 'manual',
        title: scope.title
      }).on("mouseenter", function () {
        thisElement.tooltip("show");
        $(".tooltip").on("mouseleave", function () {
          thisElement.tooltip('hide');
        });
      }).on("mouseleave", function () {
        setTimeout(function () {
          if (!$(".tooltip:hover").length) {
            thisElement.tooltip("hide");
          }
        }, 100);
      });
    }
  };
});