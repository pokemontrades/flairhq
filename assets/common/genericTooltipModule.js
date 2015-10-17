var ng = require("angular");

ng.module("genericTooltipModule", []).directive("ngGenericTooltip", function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      title: '@title'
    },
    templateUrl: '/common/genericTooltipView.html',
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