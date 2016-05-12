angular.module("app.directives")
.directive('ngAutodisable', [ '$parse', function($parse) {

    var DISABLED = 'disabled',      // Disabled attribute
        ATTRNAME = 'ngAutodisable', // The attribute name to which we store the handlers ids
        CLICK_EVENT = 'click',
        CLICK_ATTR = 'ngClick',
        SUBMIT_EVENT = 'submit',
        SUBMIT_ATTR = 'ngSubmit',
        LOADING_CLASS_ATTR = 'ngAutodisableClass';

    function isPromise(promise) {
      return promise                          &&
             angular.isFunction(promise.then) &&
             angular.isFunction(promise['finally']);
    }

    function triggerHandler(handler, scope, fn) {
      var result = fn(scope, { $event : handler.eventName });

      if (isPromise(result)) {
        handler.handlePromise(result);
      }
    }

    function linkFn(scope, element, attrs) {
      var handler;

      if (attrs.hasOwnProperty(CLICK_ATTR)) {
          handler = handlerInstance(element,
              CLICK_EVENT,
              getLoadingClass(attrs),
              getCallbacks(attrs[CLICK_ATTR]));
      } else if (attrs.hasOwnProperty(SUBMIT_ATTR)) {
          handler = handlerInstance(element.find('button[type=submit]'),
              SUBMIT_EVENT,
              getLoadingClass(attrs),
              getCallbacks(attrs[SUBMIT_ATTR]));
      } else {
          throw new Error('ngAutodisable requires ngClick or ngSubmit attribute in order to work');
      }
        
      element.unbind(handler.eventName).bind(handler.eventName, function() {
        scope.$apply(function() {
          handler.callbacks.forEach(triggerHandler.bind(null, handler, scope));
        });
      });
    }

    function getCallbacks(expression) {
      return expression.split(';').map(function(callback) {
            return $parse(callback, null, true);
          });
    }

    function getLoadingClass(attrs) {
      return attrs.hasOwnProperty(LOADING_CLASS_ATTR) ? attrs[LOADING_CLASS_ATTR] : false;
    }

    function handlerInstance(elementToDisable, eventName, loadingClass, callbacks) {
      var instance = {},
          promisesTriggered = 0;

      instance.eventName = eventName;
      instance.callbacks = callbacks;

      instance.handlePromise = function(promise) {
        if (promisesTriggered === 0) {
          disableElement();
        }
        promisesTriggered++;

        promise['finally'](function() {
          promiseDone();
        });
      };

      function promiseDone() {
        promisesTriggered--;
        if (promisesTriggered === 0) {
          enableElement();
        }
      }

      function disableElement() {
        elementToDisable.attr(DISABLED, true);
        if (loadingClass) {
          elementToDisable.addClass(loadingClass);
        }
      }

      function enableElement() {
        elementToDisable.attr(DISABLED, false);
        if (loadingClass) {
          elementToDisable.removeClass(loadingClass);
        }
      }

      return instance;
    }

    return {
      restrict : 'A',
      link  : linkFn
    };
  }]);