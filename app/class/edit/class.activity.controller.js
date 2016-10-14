'use strict';
angular.module('mainApp').controller('ClassActivity',
    ['$scope', '$rootScope','$http', 'cfpLoadingBar', '$filter', '$state', '$stateParams', '$window', 'ModalService',
        'Upload', 'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS', 'AuthService', 'USER_ROLES',
function ($scope, $rootScope, $http, cfpLoadingBar, $filter, $state, $stateParams, $window, ModalService,
    Upload, moment, DTOptionsBuilder, DTColumnDefBuilder, SETTINGS, AuthService, USER_ROLES) {

    var vm = this;

    init();

    function init() {
        $scope.dateFormat = SETTINGS.DATEFORMAT;
        $scope.$parent.route = $state.current.name;
        $scope.classId = $stateParams.id;
        $scope.dtOptions = DTOptionsBuilder.newOptions()
              .withOption('bFilter', false)
              .withOption('bInfo', false)
              .withOption('bPaginate', false)
              .withOption('bLengthChange', false)
              .withOption('columnDefs', [{ "sortable": false, "targets": [0, 6] }])

        $scope.dtColumnDefs = [
           DTColumnDefBuilder.newColumnDef(0).notSortable(),
           DTColumnDefBuilder.newColumnDef(6).notSortable()
        ];

        $scope.dtInstanceCallback = function (dtInstance) {

            dtInstance.DataTable.on('order.dt', function () {
                dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                    cell.innerHTML = i + 1;
                });
            });
        }
        getActivities();
        checkClassIsCancel();
        checkClassIsDone();
        hasAddingAssignmentPermission()
    }

    $scope.getStatusAndColor = function (startTime, endTime) {
     
   
        var status = {};
        if (moment($rootScope.currentDateTime).unix() < moment(startTime).unix()) {
          
            status = {
                status: "Not Started",
                cssClass: "status-not-started"
            };
        }
        else {
            if (moment($rootScope.currentDateTime).unix() > moment(endTime).unix()) {
               
                status = {
                    status: "Closed",
                    cssClass: "status-closed"
                };
            }
            else {
               
                status = {
                    status: "Open",
                    cssClass: "status-open"
                };
            }
        }
        return status;
    }


    $scope.isCanceledClassSession = function (item) {
        if (item) {
            return true;
        }
        return false;
    }

    function getActivities() {
        if ($scope.classId != "") {
            $http.get("ClassActivity/GetClassActivities", {
            params: {
                classId: $scope.classId,
            },
        }).success(function (response) {
            if (response.success) {
                $scope.activities = response.data;
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
    }

    function checkClassIsCancel() {
        if ($scope.classId != "") {
            $http.get("ClassActivity/CheckClassIsCancel", {
                params: {
                    classId: $scope.classId,
                },
            }).success(function (response) {
                if (response.success) {
                    $scope.isCanceled = response.data;
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
    }
    function checkClassIsDone() {
        if ($scope.classId != "") {
            $http.get("ClassActivity/CheckClassIsDone", {
                params: {
                    classId: $scope.classId,
                },
            }).success(function (response) {
                if (response.success) {
                    $scope.isClassDone = response.data;
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
    }
    $scope.deleteActivity = function (activity) {
        var modalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'OK',
            headerText: 'Delete Activity',
            bodyText: 'Are you sure you want to delete this activity?'
        };

        ModalService.showModal({}, modalOptions).then(function (result) {
            $http.post("ClassActivity/DeleteActivity", {
                activityId: activity.Id,
                classId: activity.ClassId,
                activityType: activity.ActivityType,
            }).success(function (response) {
                if (response.success) {
                    getActivities();
                    ModalService.showModal({}, {
                        headerText: 'Delete Activity',
                        bodyText: response.message
                    });
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
        });
    }

    $scope.sendRequestFeedback = function (surveyId) {
        var modalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'OK',
            headerText: 'Send Request',
            bodyText: 'Are you sure you want to send request for this session?'
        };

        ModalService.showModal({}, modalOptions).then(function (result) {
            $http.post("ClassActivity/SendEmailFeedbackRequest", {
                surveyId: surveyId
            }).success(function (response) {

                angular.forEach($scope.activities, function (activity, index) {
                    if (activity.Id === surveyId) {
                        $scope.activities[index].IsSentSurvey = true;
                    }
                });

                ModalService.showModal({}, {
                    headerText: 'Success',
                    bodyText: response.message
                });
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
        });
    }

    $scope.hasAddingFeedbackPermission = function () {
        return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                        USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
    }

    function hasAddingAssignmentPermission() {
        if ($scope.classId != "") {
            $http.get("ClassActivity/CanViewAssignment", {
                params: {
                    classId: $scope.classId,
                },
            }).success(function (response) {
                if (response.success) {
                    $scope.hasAddingAssignmentPermission = response.data;
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
    }
    $scope.preview = function (surveyId) {
        var url = "#/viewsurvey/" + surveyId;
        var win = $window.open(url, '_blank');
        win.focus();
    }
}]);
