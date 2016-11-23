angular.module("app.directives")
.directive('parameterList',function() {
    return {
        restrict:'E',
        scope: {
          parammodel:     '=ngModel'
        },
        templateUrl: 'templates/parameterList.html',
        controller: ["$scope", "$element", "$window", "$rootScope", "$location","$http","$timeout","$uibModal","logger",
            function($scope, $element, $window, $rootScope, $location,$http, $timeout,$uibModal,logger) {
            	$scope.params = [];
                $scope.paramCnt = 0;
                $scope.types = ['text','checkbox','dropdown','color','link'];
                $scope.pm = {name:'',type:'text',value:'',options:[]}
                $scope.showAddParameter = function() {
                    $scope.pm = {name:'',type:'text',value:'',options:{}}
                    $element.find('.add-parameter-button').hide('fade');                    
                    $element.find('.add-parameter-section').show('fade');
                }
                $scope.addParameter = function() {
                	if(!$scope.pm.name) return;
                    $element.find('.add-parameter-button').show('fade');                    
                    $element.find('.add-parameter-section').hide('fade');
                    if($scope.pm.type=='select') {
                    	var parts =$scope.vm;
                    }
                    $scope.params.push({id:$scope.paramCnt++,name:$scope.pm.name,type:$scope.pm.type,value:$scope.pm.value,options:$scope.pm.options});
                    $scope.writeParams();
                    $scope.parseParams();                    
                }
                $scope.cancelAddParameter = function() {
                    $scope.pm = {name:'',type:'text',value:'',options:[]}
                    $element.find('.add-parameter-button').show('fade');                    
                    $element.find('.add-parameter-section').hide('fade');
                }
                $scope.removeParameter = function(id) {
                    var i;
                    for( i = $scope.params.length - 1; i>=0; i--) {
                        if($scope.params[i].id == id) {
                            $scope.params.splice(i,1);
                            break;
                        }
                    }

                    $scope.writeParams();
                    $scope.parseParams();
                }  
                $scope.writeParams = function() {
                	$scope.parammodel = angular.copy($scope.params);
                }
                $scope.parseParams = function() {

                	if($scope.parammodel) {
                		$scope.params = angular.copy($scope.parammodel);
                		angular.forEach($scope.params,function(p){
                			if(typeof p.type !== 'undefined' && p.type=='select') {
                				angular.forEach(p.options,function(o){

                				});
                			}
                		});
                	} else $scope.params = [];
                	if($scope.params.constructor !== Array) $scope.params = [];
                }
                $scope.$watch('parammodel',$scope.parseParams);     
                $timeout($scope.parseParams,1000);                              
            }            
        ]
    }
})