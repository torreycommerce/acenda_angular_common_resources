angular.module("app.directives")
.directive("addressValidator", ["$http", function($http){

    function sameAddresses(address1, address2) {
      if(address1 && address2){
        if(address1.street_line1 == address2.street_line1
            && address1.street_line2 == address2.street_line2
            && address1.city == address2.city
            && address1.state == address2.state
            && address1.country == address2.country
            && address1.zip == address2.zip){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }

    function link (scope, element, attr) {
      element.on('click', function(){
        if(!scope.addressOptional || (scope.addressOptional && scope.addAddress)){
            if(!sameAddresses(scope.newAddress, scope.newAddress_copy)){
              $http.post("/api/address/verify", scope.newAddress).then(
                function(response){
                  if(sameAddresses(response.data.result, scope.newAddress )){
                    scope.addElement();
                  }else{
                    scope.address_found = response.data.result;
                    scope.addressValidatorError = null;
                    scope.newAddress_copy = angular.copy(scope.newAddress);
                    scope.addressValidatorMessage = "Please verify your address. Select which address you would like to use:";
                  }
                },
                function(error){
                  if(sameAddresses(scope.newAddress, scope.newAddress_copy)){
                    scope.addElement();
                  }else{
                    scope.address_found = null;
                    scope.addressValidatorError = "We couldn't verify your address. Please correct your address and try again, or click the button below to continue.";
                    scope.newAddress_copy = angular.copy(scope.newAddress);
                  }
                }
              );
            }else{
              scope.addElement();
            }
        }else{
          scope.addElement();
        }
      });
    }

    return {
        link: link
    };

}])