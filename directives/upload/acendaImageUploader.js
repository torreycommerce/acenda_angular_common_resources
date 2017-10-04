angular.module("app.directives")
.directive('acendaImageUploader', function($http, $rootScope) {
  return {
    restrict:'E',
    scope: {
      arrayImages: '=ngModel',
      bucket: '@',
      callback: '&',
      template: '@',
      inputName: '@'
  },
  templateUrl: 'templates/template_imageuploader.html',
    //link : function (scope, ele, attrs) {
        controller: ["$scope", "$element", "$window", "$rootScope","$timeout" , "$uibModal","Upload",
        function($scope, $element, $window, $rootScope,$timeout, $uibModal,Upload) {
        //$scope.arrayImages = null;

        $scope.$watch('file', function (file) {
          if( file ) { $scope.upload(file); }
        });

        // upload using the ngfileuploader
        $scope.upload = function (file) {

            if(typeof file === 'undefined') return;
            $element.find('.progress-bar').removeClass('progress-bar-danger');
            $('#filesprogress').css({display: 'none'});
            $element.find('.progress-bar')
              .css({ width: ''+0 + '%'})
              .addClass('active')
              .addClass('progress-bar-info')
              .addClass('progress-bar-striped')
              .html('Uploading ' + file.name);
            // if(typeof file === 'undefined') return;
          $http.post('/api/imagebucket/policy',  {action : 'upload', bucket : $scope.bucket} )
          .then(function(resp, status, headers, config) {
            if (typeof resp.result.id !== undefined && typeof resp.result.policy !== undefined) {
                Upload.upload({
                    url: '/api/imagebucket',
                    data: {file: file,policy:resp.result.policy}
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $('#filesprogress').css({display: 'block'});
                    $element.find('.progress-bar').css({ width: ''+progressPercentage + '%'});
                }).success(function (data, status, headers, config) {
                    $element.find('.progress-bar').removeClass('active');
                    $element.find('.progress-bar').removeClass('progress-bar-striped').html('Uploaded ' + file.name);
                    setTimeout(function() {  $('#filesprogress').hide('fade');   },1000);
                    if (typeof data.result.new_location !== undefined) {
                        if ($scope.arrayImages == null) {
                          $scope.arrayImages = [];
                        }
                        $scope.arrayImages.push({ id : data.result.id, url : data.result.url, alt: data.result.alt,
                          link : data.result.link});

                        if($scope.callback !== null) {
                          // Delay to allow page to update
                          $timeout( function(){
                              $scope.callback();
                          });
                        }

                        $timeout(function() {
                              $($element.find('#imageScroller')).animate({scrollLeft:100000});
                        });
                      }
                },function (data, status, headers, config) {
                    $element.find('.progress-bar').removeClass('active').addClass('progress-bar-danger');
                    $element.find('.progress-bar').removeClass('progress-bar-striped').html('Failed to upload');
                    console.log('error status: ' + status);
                })
            }
          })
        };


        $scope.setImageUrl = function(id) {
          $http.get('/api/imagebucket/getimageurl?bucket='+$scope.bucket+'&type=original&id='+id )
          .then(function(resp, status, headers, config) {
            if (typeof resp.result.url !== undefined) {
              angular.forEach($scope.arrayImages, function(value, key) {
                if (value.id == id)
                  value.url = resp.result.url;
              });
            }
          },function(data, status, headers, config) {
            angular.forEach($scope.arrayImages, function(value, key) {
              if (value.id == id)
                value.url = 'https://placehold.it/230x230';
            });
          });
        };

        $scope.deleteImage = function (index) {
          var r = confirm("Do you want to delete this image?");
          if (r == true) {
              $scope.arrayImages.splice(index, 1);
          }
          if($scope.callback !== null) $scope.callback();
      }

      $scope.editAttImage = function(index){
        if(!$scope.template) {
          $scope.template = "templates/file_uploader_edit.html";
        }
        var sc = $scope;
        var modalInstance = $uibModal.open({
            templateUrl: sc.template,
            controller: function($scope, file, $uibModalInstance){
              $scope.file = file;

              $scope.update = function(){
                $uibModalInstance.close($scope.file);
                if(sc.callback !== null) sc.callback();
              }

              $scope.cancel = function(){
                $uibModalInstance.dismiss('cancel');
              }

            },
            size: "md",
            resolve: {
                file: function () {
                    return ($scope.arrayImages[index]);
                }
            }
        });
      }

      $scope.openImage = function(url){
        window.open(url);
      }

      $scope.updateConfigArray = function() {
        //  $scope.$parent.main.config.params[$scope.inputName] = $scope.arrayImages;
      }

}]
};
})
