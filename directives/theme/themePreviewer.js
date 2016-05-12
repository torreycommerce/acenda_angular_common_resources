angular.module("app.directives")
.directive('themePreviewer', [function () {
  return {
    template: '<img class="img-responsive" style="display: initial;" ng-src="{{currentPreview}}">',
    restrict: 'E',
    scope: {
      imgarray: '=',
      imgbucket: '@'
    },
    link: function (scope, element, attrs) {
      scope.current = 0;
      scope.currentPreview = "";
      scope.getPreview = function(){
        if (scope.imgarray[scope.current] && scope.imgarray[scope.current].id)
          scope.currentPreview = scope.$root.getGodmodeImageUrl(scope.imgarray[scope.current].id, scope.imgbucket, 'original', 'size');
       return scope.currentPreview
      };

      var mytimer = 2000;

      if (attrs.fadetimer)
        mytimer = attrs.fadetimer;
      var prev = null;
      if (scope.imgarray)
      {
        if (!attrs.type || attrs.type == 'hover')
        {
         scope.getPreview(); 
          element.on('mouseenter', function() {
            prev = setInterval(function(){
              scope.current = (scope.current + 1) % scope.imgarray.length;
              scope.getPreview();
            }, mytimer);
          });
          element.on('mouseleave', function() {
            clearInterval(prev);
          });
        }
        else if (attrs.type == 'auto')
        {
          setInterval(function(){
              scope.current = (scope.current + 1) % scope.imgarray.length;
              scope.getPreview();
            }, mytimer);
        }
        else if (attrs.type == 'reversehover')
        {
          prev = setInterval(function(){
              scope.current = (scope.current + 1) % scope.imgarray.length;
              scope.getPreview();
            }, mytimer);
          element.on('mouseleave', function() {
            prev = setInterval(function(){
              scope.current = (scope.current + 1) % scope.imgarray.length;
              scope.getPreview();
            }, mytimer);
          });
          element.on('mouseenter', function() {
            clearInterval(prev);
          });
        }
        else if (attrs.type == 'click')
        {
          element.on('click', function() {
            scope.current = (scope.current + 1) % scope.imgarray.length;
            scope.getPreview();
          });
        }
      }
    }
  };
}])
