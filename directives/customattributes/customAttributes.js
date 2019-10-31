angular.module("app.directives")
    .directive('customAttribute', ["$http", "$timeout", function ($http, $timeout) {
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

                scope.setActiveGroup = function (groupname) {
                    Object.keys(scope.activeGroup).forEach(v => scope.activeGroup[v] = false)
                    scope.activeGroup[groupname] = true;
                };
                scope.init = function () {
                    scope.activeGroup = {'general': true};
                    scope.groups = ['general'];
                    scope.customattr = {};


                    console.log(scope.hasCustom)
                    $http.get('/api/dataschema/' + attr.modelname).then(
                        function (response) {
                            var customattr = {};
                            var tmprules = response.data.result.rules;
                            var cntgeneral = 0;
                            for (var i = 0; tmprules.length > i; i++) {
                                customattr[tmprules[i]['name']] = customattr[tmprules[i]['name']] || {};
                                customattr[tmprules[i]['name']].name = tmprules[i]['name'];
                                customattr[tmprules[i]['name']][tmprules[i]['validator']] = true;
                                customattr[tmprules[i]['name']].required = tmprules[i]['required'];
                                if (tmprules[i]['validator'] == 'in')
                                    customattr[tmprules[i]['name']].options = tmprules[i]['range'];
                                if (tmprules[i]['validator'] == 'length')
                                    customattr[tmprules[i]['name']].options = [tmprules[i]['min'], tmprules[i]['max']];
                                for (var attr in customattr) {
                                    // find groups
                                    customattr[attr].group = 'general';
                                    if (scope.grouping) {
                                        var parts = attr.split('_');
                                        if (parts.length > 1) {
                                            if (scope.groups.indexOf(parts[0]) == -1) {
                                                scope.groups.push(parts[0]);
                                            }
                                            customattr[attr].group = parts[0];
                                        }
                                    }
                                    if (customattr[attr].group == 'general') cntgeneral++;

                                    // do the custom attribute dance
                                    customattr[attr].type = 'text'; // safe
                                    if (customattr[attr].numerical)
                                        customattr[attr].type = 'number';
                                    else if (customattr[attr].email)
                                        customattr[attr].type = 'email';
                                    else if (customattr[attr].url)
                                        customattr[attr].type = 'url';
                                    else if (customattr[attr].boolean)
                                        customattr[attr].type = 'checkbox';
                                    else if (customattr[attr].password)
                                        customattr[attr].type = 'password';
                                    else if (customattr[attr].in)
                                        customattr[attr].type = 'select';

                                    if (customattr[attr].length) {
                                        customattr[attr].minlen = customattr[attr].options[0];
                                        customattr[attr].maxlen = customattr[attr].options[1];
                                    }
                                }

                            }
                            if (!cntgeneral) {
                                scope.groups.shift();
                                for (var g in scope.groups) {
                                    $timeout(function () {
                                        scope.setActiveGroup(scope.groups[g]);
                                    }, 200);
                                    break;
                                }
                            }
                            scope.hasCustom = !jQuery.isEmptyObject(customattr);
                            scope.isEmpty = jQuery.isEmptyObject(customattr);
                            scope.customattr = customattr;
                            $timeout(function () {

                                angular.forEach(scope.objectvalue,function(v,n) {
                                    if(typeof v == 'number'){  
                                        console.log('converting ' + n);
                                        scope.objectvalue[n]=v.toString();
                                    }
                                });                                
                                var taxjar_codes = {
                                    0: 'None',
                                    20010: 'Clothing',
                                    30070: 'Software as a Service',
                                    31000: 'Digital Goods',
                                    40010: 'Candy',
                                    40020: 'Supplements',
                                    40030: 'Food & Groceries',
                                    40050: 'Soft Drinks',
                                    40060: 'Bottled Water',
                                    41000: 'Prepared Foods',
                                    51010: 'Non-Prescription',
                                    51020: 'Prescription',
                                    81100: 'Books',
                                    81110: 'Textbooks',
                                    81120: 'Religious Books',
                                    81300: 'Magazines & Subscriptions',
                                    81310: 'Magazine',
                                    99999: 'Other Exempt',
                                };
                                $('label:contains("Taxjar")').parent().find('option').each(function () {
                                    var val = $(this).val().replace("number:", "");
                                    if (val in taxjar_codes) {
                                        $(this).attr('label', taxjar_codes[val]);
                                    }
                                });
                            });


                        }, function (error) {
                            console.log(scope.customattr);
                        }
                    );

                };
                scope.init();
            }
        };
    }])
