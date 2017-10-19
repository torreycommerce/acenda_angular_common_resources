angular.module("app.directives")
.directive('customAttribute', ["$http", function ($http) {
  return {
    templateUrl: 'templates/custom-attribute.html',
    restrict: 'E',
    scope: {
      modelname: '@modelname',
      objectvalue: '=',
      tabledisplay: '=',
      dynamicform: '=',
      paneldisplay: '=',
      emptymessage: '=',
      isorder: '=',
      hasCustom: '=ngModel',
      ordermethod: '='
    },
    link: function (scope, element, attr) {
      scope.init = function(){
        scope.customattr = {};
                    console.log(scope.hasCustom)
        $http.get('/api/dataschema/' + attr.modelname).then(
          function(response)
          {
            var tmprules = response.data.result.rules;
            for (var i = 0; tmprules.length > i; i++)
            {
              scope.customattr[tmprules[i]['0']] = scope.customattr[tmprules[i]['0']] || {};
              scope.customattr[tmprules[i]['0']].name = tmprules[i]['0'];
              scope.customattr[tmprules[i]['0']][tmprules[i]['1']] = true;
              if (tmprules[i]['1'] == 'in')
                scope.customattr[tmprules[i]['0']].options = tmprules[i]['range'];
              if (tmprules[i]['1'] == 'length')
                scope.customattr[tmprules[i]['0']].options = [tmprules[i]['min'], tmprules[i]['max']];
              for (var attr in scope.customattr)
              {
                  scope.customattr[attr].type = 'text'; // safe
                  if (scope.customattr[attr].numerical)
                    scope.customattr[attr].type = 'number';
                  else if (scope.customattr[attr].email)
                    scope.customattr[attr].type = 'email';
                  else if (scope.customattr[attr].url)
                     scope.customattr[attr].type = 'url';
                  else if (scope.customattr[attr].boolean)
                    scope.customattr[attr].type = 'checkbox';
                  else if (scope.customattr[attr].in)
                    scope.customattr[attr].type = 'select';
                  else if (scope.customattr[attr].safe)
                    scope.customattr[attr].type = 'text';

                  if (scope.customattr[attr].length)
                  {
                      scope.customattr[attr].minlen = scope.customattr[attr].options[0];
                      scope.customattr[attr].maxlen = scope.customattr[attr].options[1];
                  }
              }
            }
            scope.hasCustom = !jQuery.isEmptyObject(scope.customattr);
            console.log(scope.hasCustom)
            scope.isEmpty = jQuery.isEmptyObject(scope.customattr);
          }, function(error)
          {
            console.log(scope.customattr);
          }
        );

      };
      scope.init();
    }
  };
}])