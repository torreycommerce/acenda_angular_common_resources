angular.module("app.directives")
.directive('ngGridItems', function($window, $timeout, $interval) {
  return {
      restrict: 'A',
      scope: {
        ngGridItemsList: '=',
        ngGridItemsTxt: '@?',
        ngGridItemsBg: '@?',
        ngGridItemsWidth: '=?',
        ngGridItemsHeight: '=?',
        ngGridItemsFilter: '=?',
        ngGridItemTempl: '=?'
      },
      template: '<ul class="cs-grid-items"><li ng-repeat="item in displayList" style="height: {{itemHeight}}px; width: {{itemWidth}}px; background-color: {{item.color}}; -webkit-transform: translate3D({{item.positionX}}px, {{item.positionY}}px, 0px) scale3D({{item.active?1:0.001}},{{item.active?1:0.001}},{{item.active?1:0.001}}); transform: translate3D({{item.positionX}}px, {{item.positionY}}px, 0px) scale3D({{item.active?1:0.001}},{{item.active?1:0.001}},{{item.active?1:0.001}});opacity: {{item.active?1:0}}"><span class="grid-items-content">{{item[displayText]}}</span></li></ul>',
      controller: ['$scope', '$timeout', function($scope, $timeout) {
        $scope.divWidth = 600;
        $scope.divHeight = 400;
        $scope.divX = 200;
        $scope.divY = 500;
        $scope.itemWidth = 200;
        $scope.itemHeight = 200;
        $scope.itemRightMargin = 5;
        $scope.itemBottomMargin = 5;
        if ($scope.ngGridItemTempl) {
          // angular.render(template, $scope.ngGridItemTempl);
        }
        $scope.displayText = "def";

        $scope.showAll = function() {
          for(var i = 0; i < $scope.displayList.length; i++)
              $scope.displayList[i].active = true;
        };

        if (angular.isDefined($scope.ngGridItemsTxt))
            $scope.displayText = $scope.ngGridItemsTxt;

        if (angular.isDefined($scope.ngGridItemsBg))
            $scope.displayBg = $scope.ngGridItemsBg;

        if (angular.isDefined($scope.ngGridItemsWidth))
            $scope.itemWidth = $scope.ngGridItemsWidth;

        if (angular.isDefined($scope.ngGridItemsHeight))
            $scope.itemHeight = $scope.ngGridItemsHeight;

        $scope.displayList = angular.copy($scope.ngGridItemsList);

        $scope.$watch(function(scope){
            return scope.ngGridItemsList;
        },
        function(newVal) {
            $scope.displayList = angular.copy($scope.ngGridItemsList);
            $scope.showAll();
            $scope.setSize();
        }
      );

      $scope.$watch(function(scope){
        return scope.ngGridItemsFilter;
    },
    function(newVal){
        if (angular.isDefined($scope.ngGridItemsFilter))
        {
          for(var i = 0; i < $scope.displayList.length; i++)
          {
            if ($scope.displayList[i].txt.indexOf($scope.ngGridItemsFilter) > -1)
                $scope.displayList[i].active = true;
            else
                $scope.displayList[i].active = false;
          }
        }
        else
        {
          $scope.showAll();
        }
      $scope.setSize();
    }
  );

      $scope.unselectItem = function(index){
          $scope.displayList[index].active = false;
          $scope.setSize();
      };

      $scope.updateView = function()
      {
          for (var i = iAct = 0; i < $scope.displayList.length; i++)
          {
            var posX = ((iAct * $scope.itemWidth) % $scope.divWidth) / $scope.itemWidth;
            var posY = Math.floor((iAct * $scope.itemWidth) / $scope.divWidth);

            $scope.displayList[i].positionX = ((iAct * $scope.itemWidth) % $scope.divWidth) + posX * $scope.itemRightMargin + $scope.divX;
            $scope.displayList[i].positionY = (Math.floor((iAct * $scope.itemWidth) / $scope.divWidth) * $scope.itemHeight) + posY * $scope.itemBottomMargin + $scope.divY;

            if ($scope.displayList[i].active)
              iAct++;

          $scope.divHeight = $scope.displayList[i].positionY + $scope.itemHeight + $scope.itemBottomMargin + $scope.itemBottomMargin - $scope.divY;
      }
  };
  $scope.showAll();
}],
link: function(scope, iElement, iAttrs, ctrl) {
    scope.setSize = function(){
      $timeout(function(){
        scope.divX = iElement[0].offsetLeft;
        scope.divY = iElement[0].offsetTop;
        scope.divWidth = Math.floor(iElement[0].offsetWidth / scope.itemWidth) * scope.itemWidth;
        scope.updateView();
        iElement.css('height', scope.divHeight);
    }, 500);
  };
  $interval(function(){scope.setSize();}, 500);
  angular.element($window).bind('resize', function() {
      scope.setSize();
  });
  scope.$on("$routeChangeSuccess", function (event){
      scope.setSize();
  });
}
}
})
