angular.module("app.directives")
.directive('acendaQueryList',function() {
    return {
        restrict:'E',
        scope: {
          querymodel:     '=ngModel'
        },
        templateUrl: 'templates/querylist.html',
        controller: ["$scope", "$element", "$window", "$rootScope", "$location","$http","$timeout","$modal","logger",
            function($scope, $element, $window, $rootScope, $location,$http, $timeout,$modal,logger) {
                $scope.queries = [];
                $scope.queryCnt = 0;
                $scope.qb = {modelname:'product',alias:'',query:''}
             
                $scope.parseQueries = function() {
                    if(typeof $scope.querymodel === 'undefined') return;
                    var lines = $scope.querymodel.split("\n");

                    $scope.queries = [];
                    angular.forEach(lines,function(line){
                        var colon = line.indexOf(':');
                        if(colon != -1) {
                            var modelName = line.substring(0,colon);
                            var alias = modelName;
                            var query = line.substring(colon+1);
                            if(modelName.indexOf(' as ') !== -1) {
                                var splitName = modelName.split(' as ',2);
                                modelName = splitName[0];
                                alias = splitName[1];
                            }                    
                            var qObj = {id:$scope.queryCnt, model:modelName,as:alias,query:query};
                            $scope.queryCnt++;
                            console.log(qObj);
                            $scope.queries.push(qObj);
                        }
                    });
                }
                $scope.writeQueries = function() {
                    var d = '';                    
                    angular.forEach($scope.queries,function(q) {
                        d+= q.model + ' as ' + q.as + ':' + q.query + "\n";
                    })
                    $scope.querymodel = d.trim();                    
                }
                $scope.showAddQuery = function() {
                    console.log('add query');
                    $scope.qb = {modelname:'product',alias:'',query:''}
                    $element.find('.add-query-button').hide('fade');                    
                    $element.find('.query-builder-section').show('fade');
                }
                $scope.addQuery = function() {
                    $element.find('.add-query-button').show('fade');                    
                    $element.find('.query-builder-section').hide('fade');
                    $scope.qb.query = JSON.stringify(JSON.parse($scope.qb.query),null,false);
                    $scope.queries.push({id:$scope.queryCnt++,model:$scope.qb.modelname,as:$scope.qb.alias,query:$scope.qb.query});
                    $scope.writeQueries();
                    $scope.parseQueries();                    
                }
                $scope.removeQuery = function(id) {
                    console.log('remove query ' + id);
                    var i;
                    for( i = $scope.queries.length - 1; i>=0; i--) {
                        if($scope.queries[i].id == id) {
                            $scope.queries.splice(i,1);
                            break;
                        }
                    }

                    $scope.writeQueries();
                    $scope.parseQueries();
                }
                $scope.$watch('querymodel',$scope.parseQueries);     
                $timeout($scope.parseQueries,1000);
            }
        ]
    }
})

