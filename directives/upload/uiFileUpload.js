angular.module("app.directives")
.directive("uiFileUpload", [function() {
  return {
    restrict: "A",
    link: function(scope, ele) {
      return ele.bootstrapFileInput()
  }
}
}
])
