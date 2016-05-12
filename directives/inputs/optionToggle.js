angular.module("app.directives")
.directive('optionToggle', function() {
	return {
		restrict: 'E',
		require: '^ngModel',
		scope: {
      		values: '=',
            ngModel: '=ngModel'
    	},
    	template: '<span ng-repeat="value in optionValues track by $index" ng-class="{'+"'option-toogle-down'"+': ngModel == value.value}" class="label option-toogle" ng-click="click($index)">{{value.value}}</span>',
    	link : function($scope, element, attrs, ctrl){
            $scope.option = "";
    		$scope.optionValues = [];
    		angular.forEach($scope.values, function(value, index){
    			$scope.optionValues.push({value:value, isActive:false, })
    		});
    		$scope.click = function(index){
    			if($scope.optionValues[index].value == $scope.ngModel){
    				ctrl.$setViewValue("");
    			}else{
    				ctrl.$setViewValue($scope.optionValues[index].value);
    			}
    		}
    	}
  	};
});