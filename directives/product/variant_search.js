angular.module("app.directives")
.directive('variantSearch', function() {
    return {
        require: 'ngModel',
        scope: {
            options: '=',
            model: '=ngModel'
        },
        templateUrl: 'templates/product/variant_search.html',
        controller: ["$scope", "$element", "$window", "$rootScope", "$location","$http", "$timeout", "logger", "$q",
            function($scope, $element, $window, $rootScope, $location,$http, $timeout,logger,$q) {

                $scope.pattern = "";
                $scope.request_result = [];
                $scope.request_page = 1;
                $scope.request_num_total = 0;
                $scope.result = [];
                $scope.result_page = [];
                $scope.canceller = null;
                $scope.current_product_index = 0;
                $scope.current_variant_index = 0;
                $scope.limit_variants = 6;
                $scope.variant_options = [];
                $scope.globalTimeout = null;

                $scope.addVariant = function(event, product, variant){
                    console.log(product);
                    if(variant.inventory_quantity <= variant.inventory_minimum_quantity && variant.inventory_policy!='continue'){
                        event.preventDefault();
                        event.stopPropagation();
                        $scope.$root.$broadcast('errorNotif', "This item is out of stock.");
                    }else{
                        $scope.model.push(variant);
                        /*$scope.model.push({
                        'product': product,
                        'variant': variant,
                        'quantity': 1,
                        'product_id': variant.product_id,
                        'status': 'open'
                    });*/
                    }
                }

                $scope.search = function() {
                    var self=this;
                    if(self.globalTimeout != null){ clearTimeout(self.globalTimeout); }
                    self.globalTimeout = setTimeout( self.searchRequest(self), 300);
                };

                $scope.searchRequest = function(self) {
                    if(self.canceller){
                        self.canceller.resolve("cancelled");
                    }
                    self.canceller = $q.defer();
                    self.request_page = 1;
                    $http.get('/api/catalog?elastic=1&search='+self.pattern+'&query={group:product}&limit='+self.limit_variants+'&page='+self.request_page, { timeout: self.canceller.promise }).then(
                        function(response){
                            self.request_num_total = response.data.num_total;
                            self.request_result = response.data.result;
                            self.current_product_index = 0;
                            self.current_variant_index = 0;
                            self.result = self.getResult();
                        },
                        function(error){
                            console.log(error);
                        }
                    );
                };

                $scope.variantFilter = function(variant) {
                    var fields_to_match = ["sku", "barcode"];
                    angular.forEach($scope.variant_options, function(option, index){
                        fields_to_match.push(option);
                    });
                    var parsed_pattern = $scope.pattern.split(" ");
                    for(var i=0; i<parsed_pattern.length; i++){
                        for(var j=0; j<fields_to_match.length; j++){
                            if(variant[fields_to_match[j]]){
                                if(variant[fields_to_match[j]].indexOf(parsed_pattern[i]) > -1){
                                    return true;
                                }
                            }

                        }
                    }
                    return false;
                };

                $scope.getResult = function() {
                    var self=this;
                    var result = [];
                    var total_variant = 0;
                    var variant_index_temp = self.current_variant_index;
                    var product_index_temp = self.current_product_index;

                    for(var i=product_index_temp; i<self.request_result.length; i++){
                        var product =   {   name: self.request_result[i].product[0].name,
                                            variant_options: self.request_result[i].variant_options ? self.request_result[i].variant_options : [],
                                            variants: []
                                        };
                        self.variant_options = product.variant_options;
                        //Apply filter on variant array
                        var filtered_variants = self.request_result[i].product[0].variant.filter(self.variantFilter);
                        if(filtered_variants.length>0)
                            self.request_result[i].product[0].variant = filtered_variants;

                        for(var j=variant_index_temp; j<self.request_result[i].product[0].variant.length; j++){
                            if(total_variant<self.limit_variants){
                                var variant = self.request_result[i].product[0].variant[j];
                                /*var variant =   {
                                                    id: self.request_result[i].product[0].variant[j].id,
                                                    product_id: self.request_result[i].product[0].id,
                                                    name: self.request_result[i].product[0].variant[j].name,
                                                    price: self.request_result[i].product[0].variant[j].price,
                                                    sku: self.request_result[i].product[0].variant[j].sku,
                                                    barcode: self.request_result[i].product[0].variant[j].barcode,
                                                    inventory_quantity: parseInt(self.request_result[i].product[0].variant[j].inventory_quantity),
                                                    inventory_policy: self.request_result[i].product[0].variant[j].inventory_policy,
                                                    inventory_minimum_quantity: self.request_result[i].product[0].variant[j].inventory_minimum_quantity,
                                                    thumbnail: self.request_result[i].product[0].variant[j].thumbnail
                                                };*/
                                angular.forEach(product.variant_options, function(option, index){
                                    variant[option] = self.request_result[i].product[0].variant[j][option];
                                });

                                product.variants.push(variant);
                                total_variant++;
                            }else{
                                break;
                            }
                        }
                        if(product.variants.length){
                            result.push(product);
                        }
                        if(total_variant>=self.limit_variants){
                            break;
                        }else{
                            variant_index_temp = 0;
                        }
                    }
                    return result;
                };

                $scope.hasNext = function(nextPage) {
                    var self = this;
                    var total_variant = 0;
                    var nextExists = false;
                    var variant_index_temp = self.current_variant_index;
                    var product_index_temp = self.current_product_index;

                    var variant_index;
                    var product_index;;


                    for(var i=product_index_temp; i<self.request_result.length; i++){
                        for(var j=variant_index_temp; j<self.request_result[i].product[0].variant.length; j++){
                            total_variant++;
                            if(total_variant==(self.limit_variants + 1)){
                                variant_index = j;
                                product_index = i;
                            }
                            if(total_variant>=(self.limit_variants*2)){
                                self.current_variant_index = variant_index;
                                self.current_product_index = product_index;
                                nextExists = true;
                                break;
                            }

                        }
                        if(total_variant>=(self.limit_variants*2)){
                            break;
                        }else{
                            variant_index_temp = 0;
                        }
                    }
                    if(nextPage == true){
                        return nextExists;
                    }else{
                        if(nextExists == false && total_variant > self.limit_variants){
                            self.current_variant_index = variant_index;
                            self.current_product_index = product_index;
                            return true;
                        }else{
                            return false;
                        }
                    }
                };

                $scope.hasPrevious = function() {
                    var self = this;
                    var total_variant = 0;
                    var previousExists = false;
                    var variant_index_temp = self.current_variant_index;
                    var product_index_temp = self.current_product_index;

                    for(var i=product_index_temp; i>-1; i--){
                        for(var j=variant_index_temp; j>-1; j--){
                            total_variant++;
                            if(total_variant>self.limit_variants){
                                self.current_variant_index = j;
                                self.current_product_index = i;
                                previousExists = true;
                                break;
                            }
                        }
                        if(total_variant>self.limit_variants){
                            break;
                        }else{
                            if(i > 0)
                                variant_index_temp = self.request_result[i-1].product[0].variant.length - 1;
                        }
                    }
                    return previousExists;
                };

                $scope.nextPage = function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var self = this;
                    if(self.hasNext(true)){
                        self.result = self.getResult();
                    }else{
                        if(self.request_num_total > self.request_result.length){
                            self.request_page++;
                            self.loadNext();
                        }else{
                            if(self.hasNext(false))
                                self.result = self.getResult();
                        }
                    }

                };

                $scope.previousPage = function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var self = this;
                    if(self.hasPrevious()){
                        self.result = self.getResult();
                    }
                };

                $scope.loadNext = function() {
                    var self=this;
                    if(self.canceller){
                        self.canceller.resolve("cancelled");
                    }
                    self.canceller = $q.defer();

                    $http.get('/api/catalog?elastic=1&search='+self.pattern+'&query={group:product}&limit='+self.limit_variants+'&page='+self.request_page, { timeout: self.canceller.promise }).then(
                        function(response){
                            angular.forEach(response.data.result, function(product, index){
                                self.request_result.push(product);
                            });
                            self.nextPage();
                        },
                        function(error){
                            console.log(error);
                        }
                    );
                }
            }]
    };
});
