angular.module("app.directives", [])
.directive("imgHolder", [function() {
  return {
    restrict: "A",
    link: function(scope, ele) {
      return Holder.run({
        images: ele[0]
      })
    }
  }
}])

.directive('ngPassmatch', function() {
  return {
    require: 'ngModel',
    scope: {
      modelpass: '=ngPassmatch'
  },
  link: function(scope, elem, attrs, ctrl) {
      ctrl.$parsers.unshift(validate);

      // Force-trigger the parsing pipeline.
      scope.$watch('modelpass', function() {
        ctrl.$setViewValue(ctrl.$viewValue);
      }, true);

      function validate(value) {
        var isValid = scope.modelpass == value;
        ctrl.$setValidity('passmatch', isValid);
        return isValid ? value : undefined;
      }
    }
  };
})

.directive("validateEquals", [function() {
  return {
    require: "ngModel",
    link: function(scope, ele, attrs, ngModelCtrl) {
      var validateEqual;
      return validateEqual = function(value) {
        var valid;
        return valid = value === scope.$eval(attrs.validateEquals), ngModelCtrl.$setValidity("equal", valid), "function" == typeof valid ?
        valid({
          value: void 0
        }) : void 0
      },
      ngModelCtrl.$parsers.push(validateEqual), ngModelCtrl.$formatters.push(validateEqual), scope.$watch(attrs.validateEquals, function(
          newValue, oldValue) {
        return newValue !== oldValue ? ngModelCtrl.$setViewValue(ngModelCtrl.$ViewValue) : void 0
      })
    }
  }
}])

.directive('jsonToText', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {
          function into(input) {
            return angular.fromJson(input);
          }
          function out(data) {
            return angular.toJson(data);
          }
          ngModel.$parsers.push(into);
          ngModel.$formatters.push(out);
        }
    };
})

.directive("customBackground", function() {
  return {
    restrict: "A",
    controller: ["$scope", "$element", "$location",
    function($scope, $element, $location) {
      var addBg, path;
      return path = function() {
        return $location.path()
      },
      addBg = function(path) {
        switch ($element.removeClass("body-home body-special body-tasks body-lock"), path) {
          case "/": return $element.addClass("body-home");
          case "/404": return $element.addClass("body-special");
          case "/403": return $element.addClass("body-special");
          case "/wizard": return $element.addClass("body-special");
          case "/500": return $element.addClass("body-special");
          case "/signin": return $element.addClass("body-special");
          case "/change-password": return $element.addClass("body-special");
          case "/signup": return $element.addClass("body-special");
          case "/forgot-password": return $element.addClass("body-special");
          case "/lock-screen": return $element.addClass("body-special body-lock");
          case "/tasks": return $element.addClass("body-tasks");
        }
      },
      addBg($location.path()), $scope.$watch(path, function(newVal, oldVal) {
        return addBg($location.path())
      })
    }]
  }
})

.controller('ngReallyCtrl', function ($scope, $modalInstance, message, yesBtn, noBtn, yesBtnClass, noBtnClass) {
  $scope.message = message ? message : 'Are you sure ?';
  $scope.yesBtn = yesBtn ? yesBtn : '<i class="fa fa-trash"></i> Yes, Delete';
  $scope.noBtn = noBtn ? noBtn : 'No, Cancel';
  $scope.yesBtnClass = yesBtnClass ? yesBtnClass : 'btn-danger';
  $scope.noBtnClass = noBtnClass ? noBtnClass : 'btn-info';

  $scope.response = true;

  $scope.ok = function () {
      $modalInstance.close($scope.response);
  };

  $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
  };
})

.directive('ngReallyClick', ["$modal","$parse", function($modal,$parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function(event) {
        var fn = $parse(attrs.ngReallyClick);
        var modalInstance = $modal.open({
          controller: 'ngReallyCtrl',
          templateUrl: 'templates/ngReallyModal.html',
          size: 'md',
          resolve: {
            message: function () {
                return (attrs.ngReallyMessage)
            },
            yesBtn: function () {
                return (attrs.ngReallyYes)
            },
            noBtn: function () {
                return (attrs.ngReallyNo)
            },
            yesBtnClass: function () {
                return (attrs.ngReallyYesClass)
            },
            noBtnClass: function () {
                return (attrs.ngReallyNoClass)
            }
          }
        });

        modalInstance.result.then(function(response){
          setTimeout(function(){
            scope.$apply(
                fn(scope, {
                  $event: event
                })
              );
          }, 10);
        }, function(error){
        });
      })
    }
  }
}])

.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value, 10);
      });
    }
  };
})

.directive('ngRipple', ["$timeout", function($timeout) {
  return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var x, y, size, offsets;

        element.on('click touchstart', function(e) {
          var ripple = this.querySelector('.ng-ripple');
          var eventType = e.type;
          // Ripple
          if (ripple === null) {

            // Create ripple
            ripple = document.createElement('span');
            ripple.classList.add('ng-ripple');
            if (attrs.ngRipple) {
              ripple.style.backgroundColor = 'rgba(' + parseInt(attrs.ngRipple.slice(0,2), 16) + ',' + parseInt(attrs.ngRipple.slice(2,4), 16) + ',' + parseInt(attrs.ngRipple.slice(4,6), 16) + ',0.2)';
            }

            // Prepend ripple to element
            this.insertBefore(ripple, this.firstChild);

            // Set ripple size
            if (!ripple.offsetHeight && !ripple.offsetWidth) {
              size = Math.max(element[0].offsetWidth, element[0].offsetHeight);
              ripple.style.width = size + 'px';
              ripple.style.height = size + 'px';
            }
          }

          // Remove animation effect
          ripple.classList.remove('animate');

          // get click coordinates by event type
          if (eventType === 'click') {
            x = e.pageX;
            y = e.pageY;
          }
          else if(eventType === 'touchstart' && e.changedTouches) {
            x = e.changedTouches[0].pageX;
            y = e.changedTouches[0].pageY;
          }
          // set new ripple position by click or touch position
          function getPos(el) {
            for (var lx=0, ly=0; el != null && el.id != 'app'; lx += el.offsetLeft, ly += (el.offsetTop - el.scrollTop), el = el.offsetParent);
                return {left: lx, top: ly};
          };
          offsets = getPos(element[0]);
          ripple.style.left = (x - offsets.left - size / 2) + 'px';
          ripple.style.top = (y - offsets.top - size / 2) + 'px';
          //ripple.style.top = '-20px';

          // Add animation effect
          ripple.classList.add('animate');
          $timeout(function(){ripple.classList.remove('animate');}, 1000);
      });
    }
  }
}])


.directive("uiColorSwitch", [function() {
  return {
      restrict: "A",
      link: function(scope, ele) {
        return ele.find(".color-option")
        .on("click", function(event) {
          var $this, hrefUrl, style;
          if ($this = $(this), hrefUrl = void 0, style = $this.data("style"), "loulou" === style) hrefUrl = "styles/main.css", $(
            'link[href^="styles/main"]')
            .attr("href", hrefUrl);
        else {
          if (!style) return !1;
          style = "-" + style, hrefUrl = "styles/main" + style + ".css", $('link[href^="styles/main"]')
          .attr("href", hrefUrl)
        }
        return event.preventDefault();
      })
    }
  }
}])

.directive("toggleMinNav", ["$rootScope",function($rootScope) {
  return {
      restrict: "A",
      link: function(scope, ele) {
      var $content, $nav, $window, Timer, app, updateClass;
      return app = $("#app"), $window = $(window), $nav = $("#nav-container"), $content = $("#content"), ele.on("click", function(e) {
        return app.hasClass("nav-min") ? app.removeClass("nav-min") : (app.addClass("nav-min"), $rootScope.$broadcast("minNav:enabled")), e
        .preventDefault()
      }), Timer = void 0, updateClass = function() {
        var width;
        return width = $window.width(), 768 > width ? app.removeClass("nav-min") : void 0
      },
      $window.resize(function() {
        var t;
        return clearTimeout(t), t = setTimeout(updateClass, 300)
      })
    }
  }
}])

.directive("i18n", ["localize", function(localize) {
  var i18nDirective;
  return i18nDirective = {
    restrict: "EA",
    updateText: function(ele, input, placeholder) {
      var result;
      return result = void 0, "i18n-placeholder" === input ? (result = localize.getLocalizedString(placeholder), ele.attr("placeholder", result)) :
      input.length >= 1 ? (result = localize.getLocalizedString(input), ele.text(result)) : void 0
  },
  link: function(scope, ele, attrs) {
      return scope.$on("localizeResourcesUpdated", function() {
        return i18nDirective.updateText(ele, attrs.i18n, attrs.placeholder)
      }), attrs.$observe("i18n", function(value) {
        return i18nDirective.updateText(ele, value, attrs.placeholder)
      })
    }
  }
}])

.directive("collapseNav", [function() {
  return {
    restrict: "A",
    link: function(scope, ele) {
      var $a, $aRest, $lists, $listsRest, app;
      return $lists = ele.find("ul")
      .parent("li"), $lists.append('<i class="fa fa-caret-right icon-has-ul"></i>'), $a = $lists.children("a"), $listsRest = ele.children("li")
      .not($lists), $aRest = $listsRest.children("a"), app = $("#app"), $a.on("click", function(event) {
        var $parent, $this;
        return app.hasClass("nav-min") ? !1 : ($this = $(this), $parent = $this.parent("li"), $lists.not($parent)
            .removeClass("open")
            .find("ul")
            .slideUp(), $parent.toggleClass("open")
            .find("ul")
            .slideToggle(), event.preventDefault())
      }), $aRest.on("click", function() {
        return $lists.removeClass("open")
        .find("ul")
        .slideUp()
      }), scope.$on("minNav:enabled", function() {
        return $lists.removeClass("open")
        .find("ul")
        .slideUp()
      })
    }
  }
}])

.directive("highlightActive", [function() {
  return {
    restrict: "A",
    controller: ["$scope", "$element", "$attrs", "$location",
    function($scope, $element, $attrs, $location) {
        var highlightActive, links, path;
        return links = $element.find("a"), path = function() {
          return $location.path()
        },
        highlightActive = function(links, path) {
            return path = path, angular.forEach(links, function(link) {
                    var $li, $link, href;
                    return $link = angular.element(link), $li = $link.parent("li"), href = $link.attr("href"), $li.hasClass("active") &&
                    $li.removeClass("active"), path.indexOf(href) > -1 ? $li.addClass("active") : void 0
            })
        },
        highlightActive(links, $location.path()), $scope.$watch(path, function(newVal, oldVal) {
            return newVal !== oldVal ? highlightActive(links, $location.path()) : void 0
        })
    }
    ]
    }}
])

.directive("toggleOffCanvas", [function() {
  return {
    restrict: "A",
    link: function(scope, ele) {
      return ele.on("click", function() {
        return $("#app")
        .toggleClass("on-canvas")
      })
    }
  }
}])

.directive("mobileCloseMenu", [function() {
  return {
    restrict: "A",
    link: function(scope, ele) {
      return ele.on("click", function() {
        return $("#app")
        .removeClass("on-canvas")
      })
    }
  }
}])

.directive("slimScroll", [function() {
  return {
    restrict: "A",
    link: function(scope, ele, attrs) {
      return ele.slimScroll({
        height: attrs.scrollHeight || "100%"
      })
    }
  }
}])

.directive('dynamicTable', function() {
  return {
    restrict:'E',
    templateUrl: 'templates/template_dynamic-table.html'
  };
})

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
})

// UI FORMS DIRECTIVES

.directive('slider', ['$parse', '$timeout', '$rootScope', function ($parse, $timeout, $rootScope) {
    return {
        restrict: 'AE',
        replace: true,
        template: '<div><input class="slider-input" type="text" style="width:100%" /></div>',
        require: 'ngModel',
        scope: {
            max: "=",
            min: "=",
            step: "=",
            value: "=",
            ngModel: '=',
            ngDisabled: '=',
            range: '=',
            sliderid: '=',
            ticks: '=',
            ticksLabels: '=',
            ticksSnapBounds: '=',
            ticksPositions: '=',
            scale: '=',
            formatter: '&',
            onStartSlide: '&',
            onStopSlide: '&',
            onSlide: '&'
        },
        link: function ($scope, element, attrs, ngModelCtrl, $compile) {
            var ngModelDeregisterFn, ngDisabledDeregisterFn;

            initSlider();

            function initSlider() {
                var options = {};

                function setOption(key, value, defaultValue) {
                    options[key] = value || defaultValue;
                }

                function setFloatOption(key, value, defaultValue) {
                    options[key] = value || value === 0 ? parseFloat(value) : defaultValue;
                }

                function setBooleanOption(key, value, defaultValue) {
                    options[key] = value ? value + '' === 'true' : defaultValue;
                }

                function getArrayOrValue(value) {
                    return (angular.isString(value) && value.indexOf("[") === 0) ? angular.fromJson(value) : value;
                }

                setOption('id', $scope.sliderid);
                setOption('orientation', attrs.orientation, 'horizontal');
                setOption('selection', attrs.selection, 'before');
                setOption('handle', attrs.handle, 'round');
                setOption('tooltip', attrs.sliderTooltip || attrs.tooltip, 'show');
                setOption('tooltip_position', attrs.sliderTooltipPosition, 'top');
                setOption('tooltipseparator', attrs.tooltipseparator, ':');
                setOption('ticks', $scope.ticks);
                setOption('ticks_labels', $scope.ticksLabels);
                setOption('ticks_snap_bounds', $scope.ticksSnapBounds);
                setOption('ticks_positions', $scope.ticksPositions);
                setOption('scale', $scope.scale, 'linear');

                setFloatOption('min', $scope.min, 0);
                setFloatOption('max', $scope.max, 10);
                setFloatOption('step', $scope.step, 1);
                var strNbr = options.step + '';
                var decimals = strNbr.substring(strNbr.lastIndexOf('.') + 1);
                setFloatOption('precision', attrs.precision, decimals);

                setBooleanOption('tooltip_split', attrs.tooltipsplit, false);
                setBooleanOption('enabled', attrs.enabled, true);
                setBooleanOption('naturalarrowkeys', attrs.naturalarrowkeys, false);
                setBooleanOption('reversed', attrs.reversed, false);

                setBooleanOption('range', $scope.range, false);
                if (options.range) {
                    if (angular.isArray($scope.value)) {
                        options.value = $scope.value;
                    }
                    else if (angular.isString($scope.value)) {
                        options.value = getArrayOrValue($scope.value);
                        if (!angular.isArray(options.value)) {
                            var value = parseFloat($scope.value);
                            if (isNaN(value)) value = 5;

                            if (value < $scope.min) {
                                value = $scope.min;
                                options.value = [value, options.max];
                            }
                            else if (value > $scope.max) {
                                value = $scope.max;
                                options.value = [options.min, value];
                            }
                            else {
                                options.value = [options.min, options.max];
                            }
                        }
                    }
                    else {
                        options.value = [options.min, options.max]; // This is needed, because of value defined at $.fn.slider.defaults - default value 5 prevents creating range slider
                    }
                    $scope.ngModel = options.value; // needed, otherwise turns value into [null, ##]
                }
                else {
                    setFloatOption('value', $scope.value, 5);
                }

                if ($scope.formatter) options.formatter = $scope.$eval($scope.formatter);


                // check if slider jQuery plugin exists
                if ('$' in window && $.fn.slider) {
                    // adding methods to jQuery slider plugin prototype
                    $.fn.slider.constructor.prototype.disable = function () {
                        this.picker.off();
                    };
                    $.fn.slider.constructor.prototype.enable = function () {
                        this.picker.on();
                    };
                }

                // destroy previous slider to reset all options
                if (element[0].__slider)
                    element[0].__slider.destroy();

                var slider = new Slider(element[0].getElementsByClassName('slider-input')[0], options);
                element[0].__slider = slider;

                // everything that needs slider element
                var updateEvent = getArrayOrValue(attrs.updateevent);
                if (angular.isString(updateEvent)) {
                    // if only single event name in string
                    updateEvent = [updateEvent];
                }
                else {
                    // default to slide event
                    updateEvent = ['slide'];
                }
                angular.forEach(updateEvent, function (sliderEvent) {
                    slider.on(sliderEvent, function (ev) {
                        ngModelCtrl.$setViewValue(ev);
                        $timeout(function () {
                            $scope.$apply();
                        });
                    });
                });
                slider.on('change', function (ev) {
                    ngModelCtrl.$setViewValue(ev.newValue);
                    $timeout(function () {
                        $scope.$apply();
                    });
                });

                // Event listeners
                var sliderEvents = {
                    slideStart: 'onStartSlide',
                    slide: 'onSlide',
                    slideStop: 'onStopSlide'
                };
                angular.forEach(sliderEvents, function (sliderEventAttr, sliderEvent) {
                    var fn = $parse(attrs[sliderEventAttr]);
                    slider.on(sliderEvent, function (ev) {
                        if ($scope[sliderEventAttr]) {

                            var callback = function () {
                                fn($scope.$parent, { $event: ev, value: ev });
                            }

                            if ($rootScope.$$phase) {
                                $scope.$evalAsync(callback);
                            } else {
                                $scope.$apply(callback);
                            }
                        }
                    });
                });

                // deregister ngDisabled watcher to prevent memory leaks
                if (angular.isFunction(ngDisabledDeregisterFn)) {
                    ngDisabledDeregisterFn();
                    ngDisabledDeregisterFn = null;
                }

                ngDisabledDeregisterFn = $scope.$watch('ngDisabled', function (value) {
                    if (value) {
                        slider.disable();
                    }
                    else {
                        slider.enable();
                    }
                });

                // deregister ngModel watcher to prevent memory leaks
                if (angular.isFunction(ngModelDeregisterFn)) ngModelDeregisterFn();
                ngModelDeregisterFn = $scope.$watch('ngModel', function (value) {
                    if($scope.range){
                        slider.setValue(value);
                    }else{
                        slider.setValue(parseFloat(value));
                    }
                }, true);
            }


            var watchers = ['min', 'max', 'step', 'range', 'scale'];
            angular.forEach(watchers, function (prop) {
                $scope.$watch(prop, function () {
                    initSlider();
                });
            });
        }
    };
}])


.directive('file', function() {
  return {
        require:"ngModel",
        restrict: 'A',
        link: function($scope, el, attrs, ngModel){
            el.bind('change', function(event){
                var files = event.target.files;
                var file = files[0];

                ngModel.$setViewValue(file);
                $scope.$apply();
            });
        }
  };
})

.directive("uiSpinner", [function() {
  return {
    restrict: "A",
    compile: function(ele) {
      return ele.addClass("ui-spinner"), {
        post: function() {
          return ele.spinner()
        }
      }
    }
  }
}])

.directive("uiWizardForm", [function() {
  return {
    link: function(scope, ele) {
      return ele.steps()
    }
  }
}])

// UI DIRECTIVES

.directive("uiTime", [function() {
  return {
    restrict: "A",
    link: function(scope, ele) {
      var checkTime, startTime;
      return startTime = function() {
        var h, m, s, t, time, today;
        return today = new Date, h = today.getHours(), m = today.getMinutes(), s = today.getSeconds(),
        m = checkTime(m), s = checkTime(s), time = h + ":" + m + ":" + s, ele.html(time), t = setTimeout(startTime, 500)
      },
      checkTime = function(i) {
          return 10 > i && (i = "0" + i), i
      },
      startTime()
    }
  }
}])

.directive("uiWeather", [function() {
  return {
    restrict: "A",
    link: function(scope, ele, attrs) {
      var color, icon, skycons;
      return color = attrs.color, icon = Skycons[attrs.icon], skycons = new Skycons({
        color: color,
        resizeClear: !0
      }), skycons.add(ele[0], icon), skycons.play()
    }
  }
}])

.directive('ngPrint', function () {
  var printSection = document.getElementById('printSection');
  // if there is no printing section, create one
  if (!printSection) {
    printSection = document.createElement('div');
    printSection.id = 'printSection';
    document.body.appendChild(printSection);
  }
  function link(scope, element, attrs) {
    element.on('click', function () {
      var elemToPrint = document.getElementById(attrs.printElementId);
      if (elemToPrint) {
        printElement(elemToPrint);
      }
    });
    window.onafterprint = function () {
      // clean the print section before adding new content
      printSection.innerHTML = '';
    }
  }
  function printElement(elem) {
    // clones the element you want to print
    var domClone = elem.cloneNode(true);
    printSection.appendChild(domClone);
    window.print();
  }
  return {
    link: link,
    restrict: 'A'
  };
})


.directive('hoverClass', function () {
  return {
    restrict: 'A',
    scope: {
      hoverClass: '@'
    },
    link: function (scope, element) {
      element.on('mouseenter', function() {
        element.addClass(scope.hoverClass);
      });
      element.on('mouseleave', function() {
        element.removeClass(scope.hoverClass);
      });
    }
  };
})

.directive('toggleClass', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function() {
        element.toggleClass(attrs.toggleClass);
      });
    }
  };
})

.directive("goBack", [function() {
  return {
    restrict: "A",
    controller: ["$scope", "$element", "$window",
    function($scope, $element, $window) {
      return $element.on("click", function() {
        return $window.history.back()
      })
    }]
  }
}])

.directive('phone', function() {
   return{
       restrict: 'E',
       scope: {
           ngm: '=ngModel',
           myid:  '@myid',
       },
       template: '<input type="text" style="display:none" id="{{hidden}}"  ng-model="ngm" >\
                   <input type="tel" id="{{myid}}" class="form-control" value="{{ngm}}" onKeyPress="return numbersonly(this, event)" maxlength="16">',

       link: function(scope, element, attrs){
           var input;
           scope.$watch('myid', function() {
               if(scope.myid)
               {
                   input=$(document.getElementById(scope.myid));
                   scope.hidden = scope.myid.concat("hidden");
                   input.intlTelInput({
                     utilsScript: "/../../scripts/intl-tel-input/build/js/utils.js"
                   });

                   $("#".concat(scope.hidden)).val(input.intlTelInput("getNumber"));

                   input.on("keyup change", function() {
                       $("#".concat(scope.hidden)).val(input.intlTelInput("getNumber"));
                       angular.element($("#".concat(scope.hidden)).triggerHandler('input'));
                   });

               }
           });

     }
 };
})
