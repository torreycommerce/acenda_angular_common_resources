angular.module("app.directives")
.directive('customAttribute', ["$http","$timeout", function ($http,$timeout) {
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
      hasCustom: '=?ngModel',
      ordermethod: '=',
      grouping: '='
    },
    link: function (scope, element, attr) {

      scope.setActiveGroup = function(groupname) {
            Object.keys(scope.activeGroup).forEach(v => scope.activeGroup[v] = false)            
            scope.activeGroup[groupname]=true;
      };
      scope.init = function(){
        scope.activeGroup = {'general':true};
        scope.groups = ['general'];
        scope.customattr = {};
                    console.log(scope.hasCustom)
        $http.get('/api/dataschema/' + attr.modelname).then(
          function(response)
          {
            var tmprules = response.data.result.rules;
              var cntgeneral = 0;            
            for (var i = 0; tmprules.length > i; i++)
            {
              scope.customattr[tmprules[i]['name']] = scope.customattr[tmprules[i]['name']] || {};
              scope.customattr[tmprules[i]['name']].name = tmprules[i]['name'];
              scope.customattr[tmprules[i]['name']][tmprules[i]['validator']] = true;
              scope.customattr[tmprules[i]['name']].required = tmprules[i]['required'];
              if (tmprules[i]['validator'] == 'in')
                scope.customattr[tmprules[i]['name']].options = tmprules[i]['range'];
              if (tmprules[i]['validator'] == 'length')
                scope.customattr[tmprules[i]['name']].options = [tmprules[i]['min'], tmprules[i]['max']];
              for (var attr in scope.customattr)
              {
                // find groups
                scope.customattr[attr].group = 'general';     
                if(scope.grouping) {             
                    var parts = attr.split('_');
                    if(parts.length>1) {
                        if(scope.groups.indexOf(parts[0]) == -1) {
                            scope.groups.push(parts[0]);
                        }
                        scope.customattr[attr].group = parts[0];                    
                    }  
                }
                if(scope.customattr[attr].group == 'general') cntgeneral++;

                // do the custom attribute dance                
                  scope.customattr[attr].type = 'text'; // safe
                  if (scope.customattr[attr].numerical)
                    scope.customattr[attr].type = 'number';
                  else if (scope.customattr[attr].email)
                    scope.customattr[attr].type = 'email';
                  else if (scope.customattr[attr].url)
                     scope.customattr[attr].type = 'url';
                  else if (scope.customattr[attr].boolean)
                    scope.customattr[attr].type = 'checkbox';
                  else if (scope.customattr[attr].password)
                    scope.customattr[attr].type = 'password';
                  else if (scope.customattr[attr].in)
                    scope.customattr[attr].type = 'select';

                  if (scope.customattr[attr].length)
                  {
                      scope.customattr[attr].minlen = scope.customattr[attr].options[0];
                      scope.customattr[attr].maxlen = scope.customattr[attr].options[1];
                  }
              }

            }
            if(!cntgeneral) {
                scope.groups.shift();
                for(var g in scope.groups) {
                    $timeout(function() {
                       scope.setActiveGroup(scope.groups[g]);
                    },200);
                    break;
                }                   
            }            
            scope.hasCustom = !jQuery.isEmptyObject(scope.customattr);
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