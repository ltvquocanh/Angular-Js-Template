'use strict';
angular.module('mainApp').
    controller('AddCourse', ['$scope', '$http', '$rootScope', '$state', '$stateParams', 'cfpLoadingBar', 'Upload', 'ModalService',
function ($scope, $http, $rootScope, $state, $stateParams, cfpLoadingBar, Upload, ModalService) {
    init();

    function init() {
        $scope.course = {};
        $scope.imageUrl = "Frontend/images/icon-noImage.png";
        $scope.allowSubmit = true;

        $scope.course.DomainId = parseInt($stateParams.id);

        getDomainDropdownList();
    }

    $scope.save = function (courseForm) {
        $scope.allowSubmit = false;
        if (courseForm.$valid && !$scope.isDurationValid) {
            var textareaTargetTrainees = document.getElementById("textareaTargetTrainees").value;
            $scope.course.TargetTrainees = textareaTargetTrainees.replace(/\r?\n/g, '<br />');

            $http.post("AddCourse/AddCourse", {
                course: $scope.course
            }).success(function (response) {
                $scope.message = response.message;
                $rootScope.selectedDomainId = $scope.course.DomainId;
                uploadImage(response.courseId, $scope.message);
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
                $scope.allowSubmit = true;
            });
        } else {
            $scope.allowSubmit = true;
        }
    }

    function uploadImage(courseId, message) {
        if ($scope.picFile) {
            Upload.upload({
                url: 'AddCourse/UploadImage',
                data: {
                    courseId: courseId,
                    courseImage: $scope.picFile
                }
            }).then(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Add course',
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
                headerText: 'Add course',
                bodyText: message
            });
            back();
        }
    }

    function getDomainDropdownList() {
        $http.get("AddCourse/GetDomainDropdownList")
            .success(function (response) {
                if (response.success) {
                    $scope.domains = response.data;

                }
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
    }

    function back() {
        $state.go('coursecatalog');
    }

    $scope.cancel = function () {
        back();
    }

    $scope.checkMinDuration = function (number) {
        var min = 0.1;
        if (number != undefined) {
            if (number < min) {
                return true;
            } else {
                return false;
            }
        }
    }
}]);