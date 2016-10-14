'use strict';
angular.module('mainApp').
    controller('CourseGeneral', ['$scope', '$rootScope', '$http', '$state', 'cfpLoadingBar', 'Upload',
                              'ModalService', '$stateParams',
function ($scope, $rootScope, $http, $state, cfpLoadingBar, Upload, ModalService, $stateParams) {
    init();

    function init() {
        $scope.$parent.route = $state.current.name;
        $scope.course = {};
        $scope.oldImage = ""; //Old image file will be removed.
        
        $scope.isShowSummary = false;
        $scope.isShowObjectives = false;
        $scope.isShowPrerequisites = false;
        getDropdownList();
        getCourse();
    }

    $scope.save = function (courseForm) {
        if (courseForm.$valid && !$scope.isDurationValid && $scope.isMinDuration) {
            if ($scope.picFile && $scope.course.Image != null) {
                $scope.oldImage = $scope.course.Image;
            }

            var textareaTargetTrainees = document.getElementById("textareaTargetTrainees").value;
            if (textareaTargetTrainees != null) {
                $scope.course.TargetTrainees = textareaTargetTrainees.replace(/\r?\n/g, '<br />');
            }
            $scope.isSendingRequest = true;
            $http.post("CourseGeneral/EditCourse", {
                courseDto: $scope.course,
                oldImage: $scope.oldImage
            }).success(function (response) {
                $scope.message = response.message;
                console.log($scope.course);
                uploadImage($scope.course.Id, $scope.message);
                $scope.isSendingRequest = false;
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
                $scope.isSendingRequest = false;
            });
        }
    }

    function uploadImage(courseId, message) {
        if ($scope.picFile) {
            Upload.upload({
                url: 'CourseGeneral/UploadImage',
                data: {
                    courseId: courseId,
                    courseImage: $scope.picFile
                }
            }).then(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Edit course',
                    bodyText: message
                });

                back();
            }, function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.data.message
                });
            });
        } else {
            ModalService.showModal({}, {
                headerText: 'Edit course',
                bodyText: message
            });

            back();
        }
    }

    function getDropdownList() {
        $http.get("CourseGeneral/GetDomainDropdownList")
            .success(function (response) {
                $scope.domains = response.data;
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
    }

    function getCourse() {
        if ($stateParams.id != "") {
            $http.get("CourseGeneral/GetCourse", {
                params: {
                    courseId: $stateParams.id
                }
            }).success(function (response) {
                $scope.course = response.data;
                if ($scope.course.TargetTrainees != null) {
                    $scope.course.TargetTrainees = $scope.course.TargetTrainees.replace(/<br *\/?>/gi, '\n')
                }
                if ($scope.course.Image != null) {
                    $scope.imageUrl = "Uploads/CourseImages/" + $scope.course.Image;
                } else {
                    $scope.imageUrl = "Frontend/images/icon-noImage.png";
                }
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
        }
    }

    function back() {
        $state.go('viewcourse', { id: $stateParams.id });
    }

    $scope.cancel = function () {
        back();
    }

    $scope.codeSetArgs = function (val, el, attrs, ngModel) {
        return { value: val, courseId: $scope.course.Id };
    };

    $scope.nameSetArgs = function (val, el, attrs, ngModel) {
        return { value: val, courseId: $scope.course.Id };
    };

    $scope.checkMinDuration = function (number) {
        var min = 0.1;
        if (number != undefined) {
            if (number < min) {
                $scope.isMinDuration = false;
                return false;
            } else {
                $scope.isMinDuration = true;
                return true;
            }
        }
    }
}]);