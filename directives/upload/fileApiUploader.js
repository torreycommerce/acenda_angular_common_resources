angular.module("app.directives")
.directive('fileApiUploader', function($http, $rootScope) {
  return {
    restrict:'E',
    scope: {
      arrayImages: '=ngModel',
      bucket: '@',
      inputName: '@'
  },
  templateUrl: 'templates/template_file_api_uploader.html',
    //link : function (scope, ele, attrs) {
        controller: ["$scope", "$element", "$window", "$rootScope", "$modal","Upload",
        function($scope, $element, $window, $rootScope, $modal,Upload) {

          $scope.$watch('file', function (file) {
            $scope.upload($scope.file);
          });

        // upload using the ngfileuploader
        $scope.upload = function (file) {
            if(typeof file === 'undefined' || !file)
              return;
            $element.find('.progress-bar').removeClass('progress-bar-danger');
            $('#filesprogress').css({display: 'none'});
            $element.find('.progress-bar').css({ width: ''+0 + '%'}).addClass('active').addClass('progress-bar-info').addClass('progress-bar-striped').html('Uploading' + file.name);
            Upload.upload({
                url: '/api/files/upload?path='+($scope.bucket?$scope.bucket:'files'),
                data: {file: file}
            }).then(function (response) {
              $element.find('.progress-bar').removeClass('active');
              $element.find('.progress-bar').removeClass('progress-bar-striped').html('Uploaded ' + response.config.data.file.name);
              setTimeout(function() {  $('#filesprogress').hide('fade');   },1000);
                if (typeof response.data.result.new_location !== undefined) {
                    if ($scope.arrayImages == null) {
                      $scope.arrayImages = [];
                  }
                  $scope.arrayImages.push({ url : response.data.result.new_location, alt: '',
                      link : ''});
                  }
            }, function (error) {
                $element.find('.progress-bar').removeClass('active').addClass('progress-bar-danger');
                $element.find('.progress-bar').removeClass('progress-bar-striped').html('Failed to upload');
                console.log('error status: ' + error.status);
            }, function (evt) {
               var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $('#filesprogress').css({display: 'block'});
                $element.find('.progress-bar').css({ width: ''+progressPercentage + '%'});                
            });
        };

          $scope.deleteImage = function (index) {
            var r = confirm("Do you want to delete this image?");
            if (r == true) {
                $scope.arrayImages.splice(index, 1);
            }
          }

          $scope.editAttImage = function(index){
            var modalInstance = $modal.open({
                templateUrl: "templates/file_uploader_edit.html",
                controller: function($scope, file, $modalInstance){
                  $scope.file = file;

                  $scope.update = function(){
                    $modalInstance.close($scope.file);
                  }

                  $scope.cancel = function(){
                    $modalInstance.dismiss('cancel');
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
  });
