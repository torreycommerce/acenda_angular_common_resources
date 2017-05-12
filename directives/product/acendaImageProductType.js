angular.module("app.directives")
.directive('acendaImageProductType', function($http, $rootScope) {
  return {
    restrict:'E',
    scope: {
      type: '=ngModel'
  },
  templateUrl: 'templates/template_imageproducttype.html',
    //link : function (scope, ele, attrs) {
        controller: ["$scope", "$element", "$window", "$rootScope","$timeout" , "$uibModal","Upload",
        function($scope, $element, $window, $rootScope,$timeout, $uibModal,Upload) {

        $scope.options = ['default','alternate','swatch'];
        if(!$scope.options.includes($scope.type)) {
          $scope.options.push($scope.type);
        }
        $scope.selected = $scope.type;
        $scope.newtype = false;

        $http.get('/api/catalog?attributes=images.type&format=attributes')
        .success(function(resp, status, headers, config) {
            if (typeof resp.result['images.type'] !== undefined) {
              var types = Object.keys(resp.result['images.type']);
              for (var i = 0, len = types.length; i < len; i++) {
                if(!$scope.options.includes(types[i])) {
                  $scope.options.push(types[i]);
                }
              }

              $scope.selected = $scope.type;
            }
          });

}]
};
})