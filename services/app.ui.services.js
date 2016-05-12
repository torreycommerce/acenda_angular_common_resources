angular.module("app.ui.services", [])
.factory("logger", [function() {
  var logIt;
  return toastr.options = {
    closeButton: !0,
    positionClass: "toast-bottom-right",
    timeOut: "3000"
  },
  logIt = function(title, message, type) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    return toastr[type](message, title);
  },
  {
    log: function(message) {
      logIt("Info", message, "info");
    },
    logWarning: function(message) {
      logIt("Warning", message, "warning");
    },
    logSuccess: function(message) {
        logIt("Success", message, "success");
    },
    logError: function(message) {
      logIt("Error", message, "error");
    }
  }
}
])
