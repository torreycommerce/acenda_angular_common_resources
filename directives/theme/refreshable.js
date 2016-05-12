angular.module("app.directives")
.directive('refreshable', ["$rootScope",function($rootScope) {
    return {
        restrict: 'A',
        scope: {
            refresh: "=refreshable",
            themeid: "=",
        },
        link: function (scope, element, attr) {
            var refreshMe = function () {
                element.attr('src', element.attr('src'));
            };

            scope.$watch('refresh', function (newVal, oldVal) {
                if (scope.refresh) {
                    scope.refresh = false;
                    refreshMe();
                }
            });
            handleSizingResponse = function(e) {
                if(e.origin == $rootScope.serverPath) {
                  if (e.data.indexOf('theme_id') == -1) {
                    element.attr('src',e.data+'?theme_id='+scope.themeid);
                }
            }
        }
        window.addEventListener('message', handleSizingResponse, false);

        element.on('load', function() {
          iframe = document.getElementById('preview_iframe');
          if (iframe != null)
            iframe.contentWindow.postMessage('src?', $rootScope.serverPath);
      })
    }
};
}])
