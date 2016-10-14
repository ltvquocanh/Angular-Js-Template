'use strict';
angular.module('mainApp').controller('AddAssignment',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', 'ModalService', 'Upload', 'moment', 'SETTINGS',
function ($scope, $http, cfpLoadingBar, $state, $stateParams, ModalService, Upload, moment, SETTINGS) {

    var vm = this;

    init();

    function init() {
        $scope.isOpenStartDate = false;
        $scope.isOpenEndDate = false;
        $scope.newAssignment = {};
    }

    $scope.openStartDateCalendar = function (e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.isOpenStartDate = true;
        $scope.isOpenEndDate = false;
    };

    $scope.openEndDateCalendar = function (e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.isOpenEndDate = true;
        $scope.isOpenStartDate = false;
    };

    function saveAssignment(addAssignmentForm, attachmentId) {
        if (addAssignmentForm.$valid && !$scope.isPastDate($scope.newAssignment.StartTime)
            && $scope.isStartTimeLessThanEndTime($scope.newAssignment.EndTime, $scope.newAssignment.StartTime)) {
            if (attachmentId != null) {
                $http.post("AddAssignment/AddAssignment", {
                    assignmentDto: $scope.newAssignment,
                    attachmentId: attachmentId.data,
                    classId: $scope.newAssignment.classId
                }).success(function (response) {
                    $scope.newAssignment = response.data;
                    ModalService.showModal({}, {
                        headerText: 'Add Assignment',
                        bodyText: response.message,
                    });
                    $state.go('class.activity', { id: $scope.classId });
                    $scope.isSendingRequest = false;
                }).error(function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                    $scope.isSendingRequest = false;
                });
            }
            else {
                $http.post("AddAssignment/AddAssignment", {
                    assignmentDto: $scope.newAssignment,
                    classId: $scope.newAssignment.classId
                }).success(function (response) {
                    $scope.newAssignment = response.data;
                    ModalService.showModal({}, {
                        headerText: 'Add Assignment',
                        bodyText: response.message,
                    });
                    $state.go('class.activity', { id: $scope.classId });
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

    }

    $scope.save = function (addAssignmentForm, uploadedFile) {
        if (addAssignmentForm.$valid && !$scope.isPastDate($scope.newAssignment.StartTime)
            && $scope.isStartTimeLessThanEndTime($scope.newAssignment.EndTime, $scope.newAssignment.StartTime)) {
            $scope.isSendingRequest = true;
            $scope.newAssignment.classId = $stateParams.id;
            if (uploadedFile != undefined) {
                Upload.upload({
                    url: 'AddAssignment/UploadFileAssignment',
                    data: {
                        fileName: uploadedFile,
                        classId: $scope.newAssignment.classId
                    }
                }).then(function (response) {
                    $scope.attachmentId = response.data;
                    saveAssignment(addAssignmentForm, $scope.attachmentId);
                    if (response.data.success) {
                        $scope.newAssignment = response.data;
                    } else {
                        ModalService.showModal({}, {
                            headerText: 'Error',
                            bodyText: response.data.message
                        });
                        $scope.isSendingRequest = false;
                    }
                }, function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.data.message
                    });
                    $scope.isSendingRequest = false;
                });
            }
            else {
                $scope.attachmentId = null
                saveAssignment(addAssignmentForm, $scope.attachmentId);
            }
        }
    }

    $scope.cancel = function () {
        $state.go('class.activity');
    }

    $scope.getcurrentDate = function () {
        return Date.now();
    }

    $scope.isPastDate = function (startTime) {
        var currentDate = Date.now();
        currentDate = moment(currentDate).format(SETTINGS.DATEFORMAT);

        if (startTime != undefined) {
            if (moment.isDate(startTime)) {
                startTime = moment(startTime).format(SETTINGS.DATEFORMAT);
            }
            if (!moment.isDate(startTime)) {
                startTime = new Date(startTime.replace("-", ""));
            }
            if (!moment.isDate(currentDate)) {
                currentDate = new Date(currentDate.replace("-", ""));
            }
        }

        if (startTime <= currentDate) {
            return true;
        }
        return false;
    }

    $scope.isStartTimeLessThanEndTime = function (endTime, startTime) {
        if (startTime != undefined && endTime != undefined) {
            if (moment.isDate(startTime)) {
                startTime = moment(startTime).format(SETTINGS.DATEFORMAT);
            }
            if (moment.isDate(endTime)) {
                endTime = moment(endTime).format(SETTINGS.DATEFORMAT);
            }
            if (!moment.isDate(startTime)) {
                startTime = new Date(startTime.replace("-", ""));
            }
            if (!moment.isDate(endTime)) {
                endTime = new Date(endTime.replace("-", ""));
            }
        }

        if (endTime <= startTime) {
            return false;
        }
        return true;
    }
}]);
