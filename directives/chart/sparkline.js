angular.module("app.directives")
.directive("sparkline", [function() {
  return {
    restrict: "A",
    scope: {
      data: "=",
      options: "="
  },
  link: function(scope, ele) {
      var data, options, sparkResize, sparklineDraw;
      return data = scope.data, options = scope.options, sparkResize = void 0, sparklineDraw = function() {
        return ele.sparkline(data, options)
    },
    $(window)
    .resize(function() {
        return clearTimeout(sparkResize), sparkResize = setTimeout(sparklineDraw, 200)
    }), sparklineDraw()
}
}
}
])