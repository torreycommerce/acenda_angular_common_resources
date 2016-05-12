angular.module("app.directives")
.directive("gaugeChart", [function() {
  return {
    restrict: "A",
    scope: {
      data: "=",
      options: "="
  },
  link: function(scope, ele) {
      var data, gauge, options;
      return data = scope.data, options = scope.options, gauge = new Gauge(ele[0])
      .setOptions(options), gauge.maxValue = data.maxValue, gauge.animationSpeed = data.animationSpeed,
      gauge.set(data.val)
  }
}
}
])