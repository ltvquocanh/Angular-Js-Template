'use strict';
angular.module('mainApp').controller('EditAssignment',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', 'ModalService', 'Upload', 'moment', 'SETTINGS',
function ($scope, $http, cfpLoadingBar, $state, $stateParams, ModalService, Upload, moment, SETTINGS) {

    var vm = this;

    init();

    function init() {
        $scope.isClosed = false;
        $scope.isOpenStartDate = false;
        $scope.isOpenEndDate = false;
        $scope.editAssignment = {};
        getAssignmentById();
    }

    function getAssignmentById() {
        $http.get("EditAssignment/GetAssignmentById", {
            params: {
                assignmentId: $stateParams.assignmentId
            }
        }).success(function (response) {
            if (response.success) {
                $scope.editAssignment = response.data;
                isClosed();
                $scope.editAssignment.StartTime = moment($scope.editAssignment.StartTime)
                                                   .format(SETTINGS.DATEFORMAT);
                $scope.editAssignment.EndTime = moment($scope.editAssignment.EndTime)
                                                   .format(SETTINGS.DATEFORMAT);
                $scope.oldEndTime = $scope.editAssignment.EndTime;
                $scope.oldStartTime = $scope.editAssignment.StartTime;
                if ($scope.editAssignment.AttachmentId != null) {
                    $scope.hasAttachment = true;
                }
                else {
                    $scope.hasAttachment = false;
                }
            } else {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            }
        }).error(function (response) {
            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: response.message
            });
        });
    }

    function isClosed() {
        var currentDate = Date.now();
        if ($scope.editAssignment.ClassActivityStatus == 1) {
            $scope.isClosed = true;
        } else
            $scope.isClosed = false;
    }

    function saveAssignment(editAssignmentForm, attachmentID, currentDate) {
        if (editAssignmentForm.$valid
            && !$scope.isPastDate($scope.editAssignment.EndTime)
            && $scope.isStartTimeLessThanEndTime($scope.editAssignment.EndTime, $scope.editAssignment.StartTime)) {

            if (!moment.isDate($scope.editAssignment.StartTime)) {
                $scope.editAssignment.StartTime = new Date($scope.editAssignment.StartTime.replace("-", ""));
            }

            if (!moment.isDate($scope.editAssignment.EndTime)) {
                $scope.editAssignment.EndTime = new Date($scope.editAssignment.EndTime.replace("-", ""));
            }

            if (!moment.isDate(currentDate)) {
                currentDate = new Date(currentDate.replace("-", ""));
            }

            if (attachmentID != null) {
                $http.post("EditAssignment/UpdateAssignment", {
                    assignmentDto: $scope.editAssignment,
                    attachmentID: attachmentID.data,
                    hasAttachment: $scope.hasAttachment,
                    currentDate: currentDate
                }).success(function (response) {
                    $scope.editAssignment = response.data;
                    ModalService.showModal({}, {
                        headerText: 'Add Assignment',
                        bodyText: response.message,
                    });
                    getAssignmentById();
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
                $http.post("EditAssignment/UpdateAssignment", {
                    assignmentDto: $scope.editAssignment,
                    hasAttachment: $scope.hasAttachment,
                    currentDate: currentDate
                }).success(function (response) {
                    $scope.editAssignment = response.data;
                    ModalService.showModal({}, {
                        headerText: 'Add Assignment',
                        bodyText: response.message,
                    });
                    getAssignmentById();
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

    $scope.save = function (editAssignmentForm, uploadedFile) {
        var currentDateTime = new Date(moment(Date.now()).format(SETTINGS.DATEFORMAT).replace("-", ""));
        if (!moment.isDate($scope.editAssignment.StartTime)) {
            $scope.oldStartTime = new Date($scope.editAssignment.StartTime.replace("-", ""));
        }
        //start
        if (editAssignmentForm.$valid) {
            if ($scope.oldStartTime <= currentDateTime) {
                // // assignment ongoing or done
                $scope.oldStartTime = moment($scope.oldStartTime)
                                                   .format(SETTINGS.DATEFORMAT);
                if ($scope.oldStartTime !== $scope.editAssignment.StartTime) {
                    return;
                }
                if ($scope.isNewEndTimeAfterOldEndTime($scope.editAssignment.EndTime, $scope.oldEndTime)) {
                    return;
                }
            }
            else {
                // Not Started
                if ($scope.isPastDate($scope.editAssignment.StartTime) ||
                    !$scope.isStartTimeLessThanEndTime($scope.editAssignment.EndTime, $scope.editAssignment.StartTime)
                    ) {
                    return;
                }

            }

            // valid data ==> send request
            // start send request
            $scope.isSendingRequest = true;
            var currentDate = Date.now();
            currentDate = moment(currentDate).format(SETTINGS.DATEFORMAT);
            if (uploadedFile != undefined) {
                Upload.upload({
                    url: 'EditAssignment/UploadFileEditAssignment',
                    data: {
                        fileName: uploadedFile,
                        hasAttachment: $scope.hasAttachment,
                        attachmentId: $scope.editAssignment.AttachmentId,
                        classId: $scope.editAssignment.ClassId
                    }
                }).then(function (response) {
                    $scope.attachmentID = response.data;
                    saveAssignment(editAssignmentForm, $scope.attachmentID, currentDate);
                    $scope.isSendingRequest = false;
                    if (response.data.success) {
                        $scope.editAssignment = response.data;
                        $scope.isSendingRequest = false;
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
                $scope.attachmentID = null
                saveAssignment(editAssignmentForm, $scope.attachmentID, currentDate);
            }
            // end send request
        }
        // end
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

    $scope.onDeleteAttachment = function () {
        $scope.hasAttachment = !$scope.hasAttachment;
    }

    $scope.cancel = function () {
        $state.go('class.activity', { id: $scope.editAssignment.ClassId });
    }

    $scope.getcurrentDate = function () {
        return Date.now();
    }

    $scope.isPastDate = function (Time) {
        var time = Time;
        var currentDate = Date.now();
        if (time != undefined) {
            if (moment.isDate(time)) {
                time = moment(Time).format(SETTINGS.DATEFORMAT);
            }
            currentDate = moment(currentDate).format(SETTINGS.DATEFORMAT);
            if (!moment.isDate(time)) {
                time = new Date(time.replace("-", ""));
            }
            if (!moment.isDate(currentDate)) {
                currentDate = new Date(currentDate.replace("-", ""));
            }
        }

        if (time <= currentDate) {
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

    $scope.isNewEndTimeAfterOldEndTime = function (newEndTime, oldEndTimeScope) {

        var oldEndTime = angular.copy(oldEndTimeScope);
        if (newEndTime != undefined) {
            if (!moment.isDate(oldEndTime)) {
                oldEndTime = new Date(oldEndTime.replace("-", ""));
            }
            if (!moment.isDate(newEndTime)) {
                newEndTime = new Date(newEndTime.replace("-", ""));
            }
        }

        if (oldEndTime > newEndTime) {
            return true;
        }
        return false;
    }
}]);
