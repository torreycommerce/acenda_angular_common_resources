angular.module("app.directives")
.directive('acendaAggregateBuilder',function() {
    return {
        restrict:'E',
        scope: {
          modelname: '=modelname',
          modelnames: '=modelnames',
          Aggregates:     '=ngModel'
        },
        templateUrl: 'templates/aggregatebuilder.html',
        controller: ["$scope", "$element", "$window", "$rootScope", "$location","$http","$timeout","$uibModal","logger",
            function($scope, $element, $window, $rootScope, $location,$http, $timeout,$uibModal,logger) {
                $scope.aggregateCnt = 0;
                $scope.qb = {modelname:$scope.modelname,alias:'',aggregate:''}


                $scope.showAddaggregate = function() {
                    $scope.qb = {id:0,modelname:$scope.modelname,func:'SUM',field:'', alias:''}
                    $element.find('.add-aggregate-button').hide('fade');
                    $element.find('.aggregate-builder-section').show('fade');
                }
                $scope.addaggregate = function() {
                    $element.find('.add-aggregate-button').show('fade');
                    $element.find('.aggregate-builder-section').hide('fade');
                    $scope.qb.id=$scope.aggregateCnt++;

                    $scope.Aggregates.push($scope.qb);
                }
                $scope.removeaggregate = function(id) {
                    var i;
                    for( i = $scope.Aggregates.length - 1; i>=0; i--) {
                        if($scope.Aggregates[i].id == id) {
                            $scope.Aggregates.splice(i,1);
                            break;
                        }
                    }
                }
            }
        ]
    }
})
