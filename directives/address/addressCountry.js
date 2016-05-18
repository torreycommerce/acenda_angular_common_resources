angular.module("app.directives")
.directive('acendaCountryStates', function(){
    return{
        restrict:'E',
        scope: {
            country: "=ngCountry",
            state: "=ngState",
            w: "=width",
            debug: "=ngDebug",
            u: "=ngUi"
        },
        templateUrl: 'templates/address.html',
        controller: ["$timeout", "$scope", "$element", "$window", "$rootScope", "$location","$http", "$timeout", "logger",
            function($timeout, $scope, $element, $window, $rootScope, $location,$http, $timeout,logger){
                $scope._country;
                $scope._state;

                $scope.data = [];

                $scope.$watch('country',function (newVal, oldVal) {
                    $scope.init();
                });

                $scope.log = function(l){
                    if ($scope.debug == true){
                        console.log(l);
                    }
                }

                $scope.change = function(val){
                    if ($scope.state != undefined){$scope.state = val;}
                    if ($scope.state == undefined){$scope.country = val;}
                }

                $scope.init = function(){
                    $scope._country = angular.copy($scope.country);
                    $scope._state = angular.copy($scope.state);

                    $scope.width = ($scope.w != undefined ? angular.copy($scope.w) : "200px");
                    $scope.ui = ($scope.u != undefined ? angular.copy($scope.u) : false);
                    if ($scope.state != undefined){
                        $http.get('/api/region/states/'+$scope.country).then(function(res){
                            $scope.data = res.data.result;
                        }, function(res){
                            $scope.data = [];
                        });
                    }else{
                        $http.get('/api/region').then(function(res){
                            $scope.data = res.data.result;
                        }, function(res){
                            $scope.data = [];
                        });
                    }
                }
            }
        ]
    }
})
