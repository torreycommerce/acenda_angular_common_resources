angular.module("app.directives")
.directive('acendaCronGenerator', function(){
    return{
        restrict:'E',
        scope: {
            cron_string: "=ngModel",
            debug: "=ngDebug"
        },
        templateUrl: 'templates/crongenerator.html',
        controller: ["$scope", "$element", "$window", "$rootScope", "$location","$http", "$timeout", "logger",
            function($scope, $element, $window, $rootScope, $location,$http, $timeout,logger){
                $scope.$watch('cron_string',function () {
                    $scope.initCron($scope.cron_string);
                });

                $scope.selectTab = function(index){
                    if($scope.cron[index].all.active === true){
                        return "1";
                    }else if($scope.cron[index].every && $scope.cron[index].every.active === true){
                        return "2";
                    }else{
                        return "3";
                    }
                }

                $scope.setSelected = function(index){
                    $scope.cron[index].selected.active=true;
                    if ($scope.cron[index].every){ $scope.cron[index].every.active=false; }
                    $scope.cron[index].all.active=false;

                    $scope.generateCronString();
                }

                $scope.setEvery = function(index){
                    $scope.cron[index].selected.active=false;
                    if ($scope.cron[index].every){ $scope.cron[index].every.active=true; }
                    $scope.cron[index].all.active=false;

                    $scope.generateCronString();
                }

                $scope.setAll = function(index){
                    $scope.cron[index].selected.active = false;
                    if ($scope.cron[index].every){ $scope.cron[index].every.active=false; }
                    $scope.cron[index].all.active=true;

                    $scope.generateCronString();
                }

                $scope.clickSelected = function(index, key){
                    if($scope.cron[index].selected.elem.indexOf(key) >= 0 && $scope.cron[index].selected.elem.length >= 2){
                        $scope.cron[index].selected.elem.splice($scope.cron[index].selected.elem.indexOf(key),1)
                    }else if($scope.cron[index].selected.elem.indexOf(key) < 0){
                        $scope.cron[index].selected.elem.push(key);
                    }

                    $scope.generateCronString();
                }

                $scope.generateCronString = function(){
                    var c = [];
                    var cron = angular.copy($scope.cron);
                    for(x in $scope.cron){
                        if(cron[x].every && cron[x].every.active == true){
                            c[x] = '*/'+String(cron[x].every.rate);
                        }else if(cron[x].selected.active == true){
                            if (cron[x].selected.elem.length == 0){ c[x] = '*' }
                            else{
                                var s = angular.copy(cron[x].selected.elem);
                                c[x] = s.join(',');
                            }
                        }else{
                            c[x] = '*';
                        }
                    }

                    if (c.length == 5){ $scope.cron_string = c.join(" "); }
                }

                $scope.cron = [
                    {
                        'all':{'active': false},
                        'every':{'active': false, 'rate': 1},
                        'selected':{'active': false,'elem': [0]}
                    },
                    {
                        'all':{'active': false},
                        'every':{'active': false,'rate': 1},
                        'selected':{'active': false,'elem': [0]}
                    },
                    {
                        'all':{'active': false},
                        'selected':{'active': false,'elem': [0]}
                    },
                    {
                        'all':{'active': false},
                        'selected':{'active': false,'elem': [0]}
                    },
                    {
                        'all':{'active': false},
                        'selected':{'active': false,'elem': [0]}
                    }
                ];

                $scope.period_type = [
                    "minute",
                    "hour",
                    "day",
                    "week",
                    "month",
                    "year"
                ];

                var n_days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                var n_months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

                $scope.minute = [];
                $scope.hour = [];
                $scope.day = [];
                $scope.days = [];
                $scope.month = [];

                for(var i = 1; i <= 59; i++){$scope.minute.push(i);}
                for(var i = 1; i <= 23; i++){$scope.hour.push(i);}
                for(var i = 0; i <= 6; i++){$scope.day.push(n_days[i]);}
                for(var i = 1; i <= 31; i++){$scope.days.push((new String(i))+Utils.getOrdinalFor(i));}
                for(var i = 0; i <= 11; i++){$scope.month.push(n_months[i]);}

                $scope.sel_first = 5;

                $scope.initEvery = function(index, exp){

                    $scope.cron[index].all.active = false;
                    if ($scope.cron[index].every){ $scope.cron[index].every.active = true; }
                    $scope.cron[index].selected.active = false;
                    $scope.cron[index].every.rate = parseInt(exp.split('/')[1]);
                }

                $scope.initAll = function(index, exp){
                    $scope.cron[index].all.active = true;
                    if ($scope.cron[index].every){ $scope.cron[index].every.active = false; }
                    $scope.cron[index].selected.active = false;
                }

                $scope.initEach = function(index, exp){
                    $scope.cron[index].all.active = false;
                    if ($scope.cron[index].every){ $scope.cron[index].every.active = false; }
                    $scope.cron[index].selected.active = true;

                    var s = exp.split(',');
                    $scope.cron[index].selected.elem = [];
                    for(x in s){ $scope.cron[index].selected.elem.push(parseInt(s[x])); }
                }

                $scope.setMinutes = function(exp){
                    if(/^\*\/[0-9]{1,2}$/.test(exp)){$scope.initEvery(0, exp);}
                    else if(/^([0-9]{1,2}(,?)){1,59}$/.test(exp)){$scope.initEach(0, exp);}
                    else{$scope.initAll(0, exp);}
                }

                $scope.setHour = function(exp){
                    if(/^\*\/[0-9]{1,2}$/.test(exp)){$scope.initEvery(1, exp);}
                    else if(/^([0-9]{1,2}(,?)){1,59}$/.test(exp)){$scope.initEach(1, exp);}
                    else{$scope.initAll(1, exp);}
                }

                $scope.setDayOfMonth = function(exp){
                    if(/^([0-9]{1,2}(,?)){1,59}$/.test(exp)){$scope.initEach(2, exp);}
                    else{$scope.initAll(2, exp);}
                }

                $scope.setMonths = function(exp){
                    if(/^([0-9]{1,2}(,?)){1,59}$/.test(exp)){$scope.initEach(3, exp);}
                    else{$scope.initAll(3, exp); }
                }

                $scope.setDayOfWeek = function(exp){
                    if(/^([0-9]{1,2}(,?)){1,59}$/.test(exp)){ $scope.initEach(4, exp);}
                    else{ $scope.initAll(4, exp); }
                }


                $scope.initCron = function(cron){
                    var cron = cron.split(' ');
                    if (cron.length == 5){
                        $scope.setMinutes(cron[0]);
                        $scope.setHour(cron[1]);
                        $scope.setDayOfMonth(cron[2]);
                        $scope.setMonths(cron[3]);
                        $scope.setDayOfWeek(cron[4]);
                    }
                }
            }
        ]
    }
})
