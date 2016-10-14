'use strict';
angular.module('mainApp').controller('EditSurvey',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', '$window', 'ModalService',
        'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS', 'AuthService', 'USER_ROLES', 'SURVEY_TYPE',
    function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal, $window, ModalService,
        DTOptionsBuilder, DTColumnDefBuilder, SETTINGS, AuthService, USER_ROLES, SURVEY_TYPE) {

        var vm = this;
        var classId = $stateParams.id;
        init();

        function init() {
            $scope.$parent.route = $state.current.name;

            $scope.isClosed = false;
            $scope.isOpenStartDate = false;
            $scope.isOpenEndDate = false;
            $scope.editSurvey = {};
            $scope.sessions = [];
            getSurvey();
            $scope.surveyTypes = SURVEY_TYPE;                        
        }

        function getSurvey() {
            if ($stateParams.surveyId != "") {
                $http.get("EditSurvey/GetSurvey", {
                    params: {
                        surveyId: $stateParams.surveyId
                    }
                }).success(function (response) {
                    if (response.success) {
                        $scope.editSurvey = response.data;
                        isClosed();
                        $scope.editSurvey.StartTime = moment($scope.editSurvey.StartTime)
                                                           .format(SETTINGS.DATEFORMAT);
                        $scope.editSurvey.EndTime = moment($scope.editSurvey.EndTime)
                                                           .format(SETTINGS.DATEFORMAT);
                        $scope.oldEndTime = $scope.editSurvey.EndTime;
                        $scope.oldStartTime = $scope.editSurvey.StartTime;
                        if ($scope.sessions.length == 0)
                        {
                            getSessions($scope.editSurvey.ClassId);
                        }

                        if ($scope.editSurvey.ClassSessionId == null) {
                            $scope.editSurvey.ClassSessionId = 0;
                        }

                        if ($scope.editSurvey.SurveyType == 0) {
                            $scope.editSurvey.SurveyType = "";
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
        }

        function isClosed() {
            if ($scope.editSurvey.ClassActivityStatus == 1) {
                $scope.isClosed = true;
            } else
                $scope.isClosed = false;
        }

        $scope.save = function (editSurveyForm) {

            var currentDateTime = new Date(moment(Date.now()).format(SETTINGS.DATEFORMAT).replace("-", ""));
            var oldStartTime = new Date($scope.oldStartTime.replace("-", ""));
            //start
            if (editSurveyForm.$valid) {
                if (oldStartTime <= currentDateTime) {
                    // // assignment ongoing or done
                    oldStartTime = moment(oldStartTime)
                                                       .format(SETTINGS.DATEFORMAT);
                    if (oldStartTime !== $scope.editSurvey.StartTime) {
                        return;
                    }

                    //check EndTime is less than current time
                    if($scope.isPastDate($scope.editSurvey.EndTime)){
                        return;
                    }
                    //can't shorten endtime when feedback start (Not remove when need)
                    //if ($scope.isNewEndTimeAfterOldEndTime($scope.editSurvey.EndTime, $scope.oldEndTime)) {
                    //    return;
                    //}
                }
                else {
                    $window.location.reload();
                    // Not Started
                    if ($scope.isPastDate($scope.editSurvey.StartTime) ||
                        $scope.isStartTimeGreaterThanEndTime($scope.editSurvey.EndTime, $scope.editSurvey.StartTime)
                        ) {
                        return;
                    }

                }

                $scope.isSendingRequest = true;
                if (!moment.isDate($scope.editSurvey.StartTime)) {
                    $scope.editSurvey.StartTime = new Date($scope.editSurvey.StartTime.replace("-", ""));
                }
                if (!moment.isDate($scope.editSurvey.EndTime)) {
                    $scope.editSurvey.EndTime = new Date($scope.editSurvey.EndTime.replace("-", ""));
                }

                $http.post("EditSurvey/UpdateSurvey", {
                    surveyDto: $scope.editSurvey,
                    currentDate: currentDateTime
                }).success(function (response) {
                    $scope.isSendingRequest = false;
                    ModalService.showModal({}, {
                        headerText: 'Edit Feedback',
                        bodyText: response.message
                    });
                    $scope.message = response.message;
                    getSurvey();
                    $scope.isSendingRequest = false;
                }).error(function (response) {
                    $scope.isSendingRequest = false;
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                });
            }
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

        $scope.cancel = function () {
            $state.go('class.activity', { id: $scope.editSurvey.ClassId });
        }

        $scope.getcurrentDate = function () {
            return Date.now();
        }

        $scope.isPastDate = function (Time) {
            var time = Time;
            var currentDate = Date.now();
            if (time != undefined) {
                if (moment.isDate(time)) {
                    time = moment(time).format(SETTINGS.DATEFORMAT);
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

        //can't shorten endtime when feedback start (Not remove when need)
        //$scope.isNewEndTimeAfterOldEndTime = function (newEndTime, oldEndTimeScope) {

        //    var oldEndTime = angular.copy(oldEndTimeScope);
        //    if (newEndTime != undefined) {
        //        if (!moment.isDate(oldEndTime)) {
        //            oldEndTime = new Date(oldEndTime.replace("-", ""));
        //        }
        //        if (!moment.isDate(newEndTime)) {
        //            newEndTime = new Date(newEndTime.replace("-", ""));
        //        }
        //    }

        //    if (oldEndTime > newEndTime) {
        //        return true;
        //    }
        //    return false;
        //}

        $scope.isStartTimeGreaterThanEndTime = function (endTime, startTime) {
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
                return true;
            }
            return false;
        }


        function getSessions(classId) {
            $http.get("ClassSession/GetClassSessions", {
                params: {
                    classId: classId
                }
            }).success(function (response) {
                var wholeClass = {
                    Id: 0,
                    Name: "Whole class"
                };

                $scope.sessions.push(wholeClass);
                if (response.data.length != 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (!response.data[i].IsCancel) {
                            $scope.sessions.push(response.data[i]);
                        }
                    }
                }
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });

            $scope.onChangeSession = function (sessionId) {
                var currentDate = new Date();
                var sessionSelected = {};

                if ($scope.sessions.length > 1) {
                    for (var i = 0; $scope.sessions.length; i++) {
                        if ($scope.sessions[i].Id == sessionId) {
                            sessionSelected = $scope.sessions[i];
                            break;
                        }
                    }

                    $scope.editSurvey.StartTime = addDate(currentDate, "minute", 5);
                    $scope.editSurvey.EndTime = addDate($scope.editSurvey.StartTime, "day", 2);
                }
            }
        }

        function addDate(date, interval, units) {
            var newDate = new Date(date);
            switch (interval.toLowerCase()) {
                case 'day':
                    newDate.setDate(newDate.getDate() + units);
                    break;
                case 'minute':
                    newDate.setTime(newDate.getTime() + units * 60000);
                    break;
            }

            return newDate;
        }
    }]);
