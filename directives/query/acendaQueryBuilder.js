angular.module("app.directives")
.directive('acendaQueryBuilder',function() {
    return {
        restrict:'E',
        scope: {
          modelname: '=modelname',
          querymodel:     '=ngModel'
        },
        templateUrl: 'templates/querybuilder.html',
        controller: ["$scope", "$element", "$window", "$rootScope", "$compile", "$location","$http","$timeout","logger",
            function($scope, $element, $window, $rootScope, $compile, $location,$http, $timeout,logger) {
                $scope.obj={fieldnames: [],selectedfield: '',gotfieldnames: false};
                $scope.querymodel;

                $scope.updateQueryModel = function(){
                    try{
                        var json = angular.fromJson($scope.querymodel);
                        $scope.createQueryBlock($element.find(".query_block"), json, true);
                    }catch(e){}
                }

                $scope.$watch('modelname',function () {
                    $scope.obj.gotfieldnames=false;
                    $scope.updateQueryTree();
                })


                $scope.testQuery = function() {
                    if($scope.obj.gotfieldnames === false) {
                        $timeout($scope.testquery(),200);
                        return;
                    }
                    $scope.updateQuery();

                    if($scope.querymodel == "") {
                        $scope.querymodel = null;
                    }

                    $element.find('.table-dynamic').scope().setTableName($scope.modelname);
                    $element.find('.table-dynamic').scope().query = angular.fromJson($scope.querymodel);
                    $element.find('.table-dynamic').scope().loaded = false;
                    $element.find('.table-dynamic').scope().setContent();
                }

                $scope.updateLabels = function(selector, inParent) {
                    var t = $scope;

                    $(selector).children().each(function() {

                        var titlediv = $(this).children().first();
                        if(inParent == false && $(this).is(':first-child')) {
                            $(this).find('h4').first().html("WHERE");
                            titlediv.addClass("logic-where");
                            titlediv.removeClass("logic-or");
                            titlediv.removeClass("logic-and");
                            $(this).find('.action-remove').first().css('display','none');
                        } else if($(this).is(':first-child')) {
                            $(this).find('h4').first().html("AND");
                            titlediv.addClass("logic-and");
                            titlediv.removeClass("logic-or");
                            titlediv.removeClass("logic-where");
                            $(this).find('.action-remove').first().css('display','inline');
                        } else {
                            $(this).find('h4').first().html("OR");
                            titlediv.addClass("logic-or");
                            titlediv.removeClass("logic-and");
                            titlediv.removeClass("logic-where");
                            $(this).find('.action-remove').first().css('display','inline');
                        }

                        t.updateLabels($(this).find(".list-group").first(), true);

                    });
                }

                $scope.removeQuery = function(el) {
                    var item =  el.parent().parent().parent().parent();
                    var t = $scope;
                    item.parent().append(item.find('li'));
                    item.remove();
                    t.updateQuery();
                    return false;
                }

                $scope.addAndQuery = function(el) {
                    var t = $scope;
                    var parent =  el.parent().parent().parent().parent();
                    var ul     =  parent.find("ul").first();
                    var existLi=  ul.find('li').first();

                    var item = parent.clone();
                    item.find("ul").html(' ');
                    item.find(".field-value").val('');

                    if(existLi) {
                        item.find("ul").append(existLi);
                        ul.find('li').first().remove();
                    }

                    item.find("a.action-and").unbind().click(function() {
                        return t.addAndQuery($(this));
                    });
                    item.find("a.action-or").unbind().click(function() {
                        return t.addOrQuery($(this));
                    });
                    item.find("a.action-remove").unbind().click(function() {
                        return t.removeQuery($(this));
                    });
                     item.find("input").unbind().keyup(function() {
                        t.updateQuery();
                    });
                    item.find("select").unbind().change(function() {
                        t.updateQuery();
                    });

                    parent.find("ul").first().append(item);
                    t.updateQuery();
                    var t = $scope;
                    $element.find(".dropitem").sortable({
                        forcePlaceholderSize: true,
                        connectWith: "ul.dropitem",
                        stop: function() {
                            t.updateQuery();
                        }
                    });
                    return false;
                }

                $scope.addOrQuery = function(el) {
                    var t = $scope;
                    var item = el.parent().parent().parent().parent().clone();
                    item.find("ul").html(' ');

                    item.find("a.action-and").unbind().click(function() {
                        return t.addAndQuery($(this));
                    });
                    item.find("a.action-or").unbind().click(function() {
                        return t.addOrQuery($(this));
                    });
                    item.find("a.action-remove").unbind().click(function() {
                        return t.removeQuery($(this));
                    });
                    item.find("input").unbind().unbind().keyup(function() {
                        t.updateQuery();
                    });
                    item.find("select").unbind().change(function() {
                        t.updateQuery();
                    });
                    el.parent().parent().parent().parent().parent().append(item);
                    t.updateQuery();

                    var t = $scope;
                    $element.find(".dropitem").sortable({
                        forcePlaceholderSize: true,
                        connectWith: "ul.dropitem",
                        stop: function() {
                            t.updateQuery();
                        }
                    });
                    return false;
                }
                $scope.formatQueryValue = function(action,value)
                {
                    if(typeof value === 'undefined') value = '';
                    switch(action) {
                        case '$exists':
                            if(value != 'false') {
                                value = 'true';
                            }
                            break;
                        case '$in':
                        case '$nin':
                            var value = value.match(/([^\"\',]*((\'[^\']*\')*||(\"[^\"]*\")*))+/gm);
                            var values = [];
                            for (var key=0;key<value.length;key++) {
                                value[key] = $.trim(value[key]);
                                if(value[key][0] == '"' && value[key][(value[key].length - 1)] == '"'
                                || value[key][0] == "'" && value[key][(value[key].length - 1)] == "'" ) {
                                    value[key] = value[key].substring(1,(value[key].length - 1));
                                }
                                if(value[key] != '') {
                                    values.push(value[key]);
                                }
                            }
                            return values;
                            break;
                        case '$lt':
                        case '$gt':
                        case '$lte':
                        case '$gte':
                        case '$regex':
                        case '$ne':
                        case '$e':
                            break;
                    }
                    return value;
                }
                $scope.createQueryBlock = function(ul, query, first) {
                    var childCount = 0;
                    var currentUl = ul;
                    var t = $scope;
                    for (var item in query) {
                        var field  = '';
                        var action = '';
                        var value  = '';

                        if(item == '$or') {
                            for (var i in query[item]) {
                                t.createQueryBlock(currentUl, query[item][i], first);
                                first = false;
                            }
                        } else {
                            if(typeof query[item] !== 'object') {
                                action = "$e";
                                value  = query[item];
                                field  = item;
                                query[item] = {};
                                query[item][action] = value;
                            }
                            field  = item;
                            for(var action in query[item]) {
                                value  = query[item][action];
                                if(typeof value === 'object') {
                                    var values = "";
                                    for(var i=0; i<value.length; i++){
                                        if(values != '') values += ',';
                                        if(value[i].indexOf(",")>0) {
                                            values += '"'+value[i]+'"';
                                        } else {
                                            values += value[i];
                                        }
                                    }


                                    value = values;
                                }

                                var li = $element.find(".query_block li").last().clone();
                                li.find('.field-name').first().val(field);
                                li.find('.field-action').first().val(action);
                                if(typeof value == 'string' || typeof value == 'number') { li.find('.field-value').first().val(value); }
                                li.find("ul").html('');

                                if(first) {
                                    currentUl.find('li').remove();
                                    first = false;
                                }

                                li.find("a.action-and").click(function() {
                                    return t.addAndQuery($(this));
                                });
                                li.find("a.action-or").click(function() {
                                    return t.addOrQuery($(this));
                                });
                                li.find("a.action-remove").click(function() {
                                    return t.removeQuery($(this));
                                });
                                li.find("input").keyup(function() {
                                    t.updateQuery();
                                });
                                li.find("input,select").change(function() {
                                    t.updateQuery();
                                });
                                currentUl.append(li);
                                currentUl = li.find('ul').first();
                            }
                        }
                        childCount++;
                    }
                    $compile($element.find(".query_block"),$scope);
                }

                $scope.updateQueryTree = function() {
                    if($scope.obj.gotfieldnames === false ) {
                        if(typeof $scope.modelname == 'undefined') {
                            $scope.modelname = $element.attr('modelname');
                        }
                        $http.get('/api/'+$scope.modelname.toLowerCase()+'?format=fields').then(function(resp, status, headers, config) {
                            resp = resp.data;
                            if(typeof resp.result !== 'undefined ') {
                                for(var i = 0 ; i<resp.result.length; i++) {
                                    $scope.obj.fieldnames[i] = { name: resp.result[i], value: resp.result[i] };
                                }
                                $scope.obj.gotfieldnames=true;
                                $timeout(function() {
                                    $scope.updateQueryTree();
                                    $scope.updateQuery();
                                },200);
                            }
                        });
                        return;
                    }

                    //var q = JSON.parse($scope.querymodel);
                    if ($scope.querymodel != '')
                    {
                        var q = angular.fromJson($scope.querymodel);
                        $scope.createQueryBlock($element.find(".query_block"), q, true);
                        $scope.updateQuery();
                    }
                 }
                $scope.updateData = function(selector, command, parentFieldName) {
                            var t = $scope;
                            var numberChildren = $(selector).children().length;

                            var childCount = 0;
                            var exec = true;
                            if(command == false) {
                                command = {};
                                if(numberChildren > 1) {
                                    command['$or'] = {};
                                }
                            }

                            $(selector).children().each(function() {

                                var value = $(this).find(".field-value").first().val();
                                var action = $(this).find(".field-action").first().val();
                                var field = $(this).find(".field-name").first().val();

                                if (field == null){
                                    exec = false;
                                    return exec;
                                }

                                if(field == 'undefined' || field == '?') field ='';
                                value = t.formatQueryValue(action, value);

                                if(field != '') {
                                    if(numberChildren > 1) {

                                        if(typeof command['$or'] === 'undefined' || typeof command['$or'].length === 'undefined') {
                                            command['$or'] = [];
                                        }
                                        command['$or'][childCount] = {};
                                        command['$or'][childCount][field] = {};
                                        switch(action) {
                                            case '$exists':
                                            case '$lt':
                                            case '$gt':
                                            case '$lte':
                                            case '$gte':
                                            case '$in':
                                            case '$nin':
                                            case '$regex':
                                            case '$ne':
                                                command['$or'][childCount][field][action] = value;
                                                break;
                                            case '$e':
                                                command['$or'][childCount][field] = value;
                                                break;
                                        }
                                        command['$or'][childCount] = t.updateData($(this).find(".list-group").first(), command['$or'][childCount]);
                                    } else {
                                        if(parentFieldName == field) {
                                            var oldAction = command[field];
                                            if(typeof oldAction == 'object') {
                                                command[field][action] = value;
                                            } else {
                                                command[field] = {};
                                                command[field]['$e'] = oldAction;
                                                command[field][action] = value;
                                            }
                                        } else {
                                            switch(action) {
                                                case '$exists':
                                                case '$lt':
                                                case '$gt':
                                                case '$lte':
                                                case '$gte':
                                                case '$in':
                                                case '$nin':
                                                case '$regex':
                                                case '$ne':
                                                    command[field] = {};
                                                    command[field][action] = value;
                                                    break;
                                                case '$e':
                                                    command[field] = value;
                                                    break;
                                            }
                                        }
                                        command = t.updateData($(this).find(".list-group").first(), command, field);

                                    }
                                    childCount++;
                                }
                            });
                            return exec ? command : angular.fromJson($scope.querymodel);
                }
                $scope.updateQuery = function() {
                    if($scope.obj.gotfieldnames === false) return;

                    if($scope.querymodel == "") {
                        $scope.querymodel = "{}";
                    }
                    $scope.updateLabels($element.find(".query_block").first(), false);

                    var t = $scope;
                    $element.find("a.action-and").first().unbind().click(function() {
                        return t.addAndQuery($(this));
                    });
                    $element.find("a.action-or").first().unbind().click(function() {
                        return t.addOrQuery($(this));
                    });
                    $element.find("a.action-remove").first().unbind().click(function() {
                        return t.removeQuery($(this));
                    });
                    $element.find("input").first().unbind().keyup(function() {
                        t.updateQuery();
                    });
                    $element.find("select").first().unbind().change(function() {
                        t.updateQuery();
                    });

                    command = $scope.updateData($element.find(".query_block").first(), false);
                    var spaces = 4;
                    value = JSON.stringify(command, undefined, spaces);
                    if(value == '{}' || value == '""') {
                        value = '';
                    }
                    $scope.querymodel = value;

                }
                $scope.buildQuery = function() {
                  //  $scope.updateQuery();
                    $element.find(".dropitem").sortable({
                        forcePlaceholderSize: true,
                        connectWith: "ul.dropitem",
                        stop: function() {
                           $scope.updateQuery();
                        }
                    });
                }
                $scope.builderHtml = function() {
                          return '<div><ul class="query_block list-group dropitem ">\
                                <li class="list-group-item panel panel-primary">\
                                    <div class="panel-body query-item-body">\
                                        <div class="row">\
                                            <div class="form-group col-sm-2">\
                                                <h4>WHERE</h4>\
                                            </div>\
                                            <span style="" class="help-text"></span>\
                                            <div class="form-group col-sm-10">\
                                                <select class="form-control field-name">\
                                                    <option value="">Select Field...</option>\
                                                </select>\
                                            </div>\
                                        </div>\
                                        <div class="row">\
                                            <div class="form-group col-sm-2"></div>\
                                            <div class="form-group col-sm-10">\
                                                <select class="form-control field-action">\
                                                    <option value="$e">is equal to (string)</option>\
                                                    <option value="$ne">is not equal to (string)</option>\
                                                    <option value="$in">is in (string, string, ...)</option>\
                                                    <option value="$nin">is not in (string, string, ...)</option>\
                                                    <option value="$exists">exists (true or false)</option>\
                                                    <option value="$lt">is less than (number)</option>\
                                                    <option value="$gt">is greater than (number)</option>\
                                                    <option value="$lte">is less than or equal to (number)</option>\
                                                    <option value="$gte">is greater than or equal to (number)</option>\
                                                    <option value="$regex">is in regular expression (regex)</option>\
                                                </select>\
                                            </div>\
                                        </div>\
                                        <div class="row">\
                                            <div class="form-group col-sm-2"></div>\
                                            <div class="form-group col-sm-6">\
                                                <input type="text" class="form-control field-value" placeholder="Value">\
                                            </div>\
                                            <div class="form-group col-sm-4">&nbsp;\
                                                <a class="btn btn-success action-and"><i class="fa fa-plus"></i> AND</a>\
                                                <a class="btn btn-primary action-or"><i class="fa fa-plus"></i> OR</a>\
                                                <a class="btn btn-default action-remove"><i class="fa fa-trash-o"></i></a>\
                                            </div>\
                                        </div>\
                                        <ul class="list-group dropitem ">\
                                        </ul>\
                                        <div class="end-marker"></div>\
                                    </div>\
                                </li>\
                            </ul></div>';

                }

            }

        ]
    }
})
