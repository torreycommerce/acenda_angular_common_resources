angular.module("app.directives")
.directive('acendaAjaxupload', function($http) {
    return {
        scope: {
            multiple: '@'
        },
        templateUrl: 'templates/generic_file_upload.html',
        controller: ["$scope", "$element", "$window", "$rootScope", "$location", "logger",
        function($scope, $element, $window, $rootScope, $location, logger) {
            $scope.Math = window.Math;
            $scope.options = {
                disableImageResize: false,
                name: "files",
                multiple: false,
                method: "POST",
                autoUpload: false
            };

            $scope.merge_config = function(){
                angular.extend($scope.options, $scope.$parent.config_fileupload);

                var err = $scope.options.error;
                $scope.options.error = function(data){
                    var tmpErrors = "<ul>";
                    for (var key in data.responseJSON.error) {
                        if (Array.isArray(data.responseJSON.error[key])) {
                            for (index in data.responseJSON.error[key]) {
                                tmpErrors += "<li>" + data.responseJSON.error[key][index] + "</li>";
                            }
                        }
                        else{ tmpErrors += "<li>" + data.responseJSON.error[key] + "</li>"; }
                    }

                    logger.logError(tmpErrors)
                    err(data);
                }

                    // Dupplicated from interceptor
                    $scope.options = Utils.rewriteUrl($scope.options, $rootScope, $location);
                }

                $scope.merge_config();

                $scope.cancelUpload = function(index, $e){
                    $scope.$parent.files_uploaded[index].$cancel();
                    $scope.$parent.files_uploaded[index] = undefined;
                }

                $scope.$on('fileuploadadd', function(e, data) {
                    $scope.$parent.files_uploaded = data.originalFiles;
                    $scope.merge_config();

                    if ($scope.options.formData){ data.formData = $scope.options.formData; }
                    data.submit();
                });

                $scope.uploader_click = function(e){
                    $scope.merge_config();
                    // Make the div around to trigger a click on the file input
                    $(e.currentTarget).find('input[type="file"]').click();
                }
            }]
        };
    })
