angular.module("app.filters", [])

.filter('wizardstep', function() {
  return function(input) {
    var tmpArray = input.split('-');
    for (var i = 0; i < tmpArray.length; i++)
    {
      if (tmpArray[i].length > 2)
        tmpArray[i] = tmpArray[i].substring(0,1).toUpperCase() + tmpArray[i].substring(1);
    }
    return tmpArray.join(" ");
  };
})

.filter('formatpropertytitle', function() {
  return function(input, param) {
    if (input != "")
    {
      input = input.substring(0,1).toUpperCase() + input.substring(1);
      input = input.match(/([A-Z]|[a-z])[a-z]+/g).join(' ');
    }
    return input;
  }
})

.filter('queryBuilderMinified', function(){
    return function(input){
              if(angular.isString(input))
                  input = input.replace(/([^"]+)|("(?:[^"\\]|\\.)+")/, function($0, $1, $2) {
                                                if ($1) {
                                                    return $1.replace(/\s/g, '');
                                                } else {
                                                    return $2;
                                                }
                                        });
              return input;
            }
})

.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
})

.filter('ConfirmedEmail', function(element) {
  return element.status == 1 ? true : false;
})

.filter('PendingEmail', function(element) {
  return element.status == 0 ? true : false;
})

.filter('ReportStatus', function () {
    return function (obj, statuses) {
        var items = {
            status: statuses,
            out: []
        };
        angular.forEach(obj, function (value, key) {
            if (this.statuses[value.status] === true) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
})


.filter('oneLineAddress', function($sce){
  return function(address) {

    var one_line = "";
    if(address){
      if(address.first_name && address.last_name){
        if(address.first_name != "" || address.last_name != ""){
            one_line += address.first_name + " " + address.last_name + ", ";
        }
      }
      if(address.company){
          one_line += address.company + "</br>"
      }else{
        if(address.first_name && address.last_name){
          one_line += "</br>"
        }
      }
      if(address.street_line1){
          one_line += address.street_line1 + "</br>"
      }
      if(address.street_line2){
          one_line += address.street_line2 + "</br>"
      }
      one_line +=  address.city + ", " + address.state + " " + address.zip + " " + address.country;
    }
    return $sce.trustAsHtml(one_line);
  };

})

.filter('titleCase', function() {
    return function(input) {
      input = input || '';
      if (typeof input.replace !== "undefined") {
        return input.replace(/_{1,}/g,' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      }
      return input;
    };
})

.filter('couponlol', function() {
  return function(input) {
      input = input || '';
      return input.join(', ');
  }
})

.filter('acenDate', function($filter) {
    return function(input) {
      input = input || '';
      var d =  moment(input).toDate();
      var _date = $filter('date')(d, 'mediumDate');

      return _date;
    };
})
.filter('acenDateTime', function($filter) {
    return function(input) {
      input = input || '';
      var d =  moment(input).toDate();
      var _date = $filter('date')(d, 'medium');

      return _date;
    };
})
.filter('acenFromNow', function($filter) {
    return function(input) {
      input = input || '';
      var d =  moment(input).fromNow();
      return d;
    };
})
.filter('phoneNumber', function($filter) {
    return function(input) {
      var phone = "";
      if(input && input.length == 10){
        phone = "("+input.slice(0,3)+")"+" "+input.slice(3,6)+"-"+input.slice(6,10);
      }else{
        phone = input;
      }

      return phone;
    };
})
.filter('toJson', function($filter) {
    return function(input) {
      var toto = angular.toJson(input, true);
      return toto;
    };
})
.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  }
})
.filter('unslugify', function($filter) {
    return function(input) {
      var tmpArray = input.split('_');
      for (var i = 0; i < tmpArray.length; i++)
      {
        if (tmpArray[i].length > 2)
          tmpArray[i] = tmpArray[i].substring(0,1).toUpperCase() + tmpArray[i].substring(1);
      }
      return tmpArray.join(" ");
    };
})
.filter('customerIP', function() {
    return function(input) {
      if (typeof input !== 'undefined') {
        if (input.indexOf(',') !== -1) {
          var tmpArray = input.split(',');
          return tmpArray[0];
        }
        return input;
      }
    };
})
.filter('underscoreless', function () {
  return function (input) {
      if (typeof input !== 'undefined') {
          return input.replace(/_/g, ' ');
      }
      return input;
  };
})
.filter('titlecase', function() {
    return function (input) {
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

        if(typeof input == 'undefined') return input;

        input = input.toLowerCase();
        return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }

            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }

            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    }
});
