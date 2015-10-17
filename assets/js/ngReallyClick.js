var ng = require("angular");

ng.module('ngReallyClickModule', ['ui.bootstrap'])
  .directive('ngReallyClick', ['$uibModal',
    function ($uibModal) {

      var ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.ok = function () {
          $modalInstance.close();
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      return {
        restrict: 'A',
        scope: {
          ngReallyClick: "&"
        },
        link: function (scope, element, attrs) {
          element.bind('click', function () {
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
            var defaultHtml = '<div class="modal-body">Are you sure you want ' +
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

            var modalInstance = $uibModal.open({
              template: modalHtml,
              controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function () {
              scope.ngReallyClick();
            }, function () {
              //Modal dismissed
            });

          });

        }
      };
    }
  ]);