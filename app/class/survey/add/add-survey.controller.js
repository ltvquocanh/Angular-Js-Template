'use strict';
angular.module('mainApp').controller('AddSurvey',
['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', '$window',
        'ModalService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS', 'SURVEY_TYPE',
    function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal, $window,
        ModalService, DTOptionsBuilder, DTColumnDefBuilder, SETTINGS, SURVEY_TYPE) {

        var vm = this;

        init();

        function init() {
            getSurveyTemplate();

            $scope.isOpenStartDate = false;
            $scope.isOpenEndDate = false;
            $scope.isCopySurvey = true;
            $scope.accordion = 1;
            $scope.newSurvey = {};
            $scope.sessions = [];
            $scope.checkedSurvey = {};
            $scope.surveyTypes = SURVEY_TYPE;
        }

        $scope.create = function (addSurveyForm, accordion) {
            $scope.newSurvey.classId = $stateParams.id;

            if (addSurveyForm.$valid
                && !$scope.isPastDate($scope.newSurvey.StartTime)
                && !$scope.isStartTimeGreaterThanEndTime($scope.newSurvey.EndTime, $scope.newSurvey.StartTime)) {
                $scope.isSendingRequest = true;
                if ($scope.isCopySurvey == false) {
                    angular.forEach($scope.surveyTemplates[accordion - 1].Pages, function (page, key) {
                        delete page.Id;
                        delete page.SurveyId;
                        angular.forEach(page.Questions, function (question, key) {
                            delete question.Id;
                            delete question.PageId;
                            angular.forEach(question.Options, function (option, key) {
                                delete option.Id;
                                delete option.questionId;
                            });
                        });
                    });
                    $scope.newSurvey.Pages = angular.copy($scope.surveyTemplates[accordion - 1].Pages);
                    $http.post("AddSurvey/AddNewSurvey", {
                        surveyDto: $scope.newSurvey,
                        surveyTemplateId: $scope.checkedSurvey.Id,
                        classId: $scope.newSurvey.classId,
                    }).success(function (response) {
                        var surveyId = response.data;
                        ModalService.showModal({}, {
                            headerText: 'Add New Feedback',
                            bodyText: response.message,
                        });
                        $scope.isSendingRequest = false;
                        $state.go("survey.question", { surveyId: surveyId })
                    }).error(function (response) {
                        ModalService.showModal({}, {
                            headerText: 'Error',
                            bodyText: response.message
                        });
                        $scope.isSendingRequest = false;
                    });
                } else {
                    $http.post("AddSurvey/AddNewSurvey", {
                        surveyDto: $scope.newSurvey,
                        classId: $scope.newSurvey.classId,
                    }).success(function (response) {
                        var surveyId = response.data;
                        ModalService.showModal({}, {
                            headerText: 'Add New Feedback',
                            bodyText: response.message,
                        });
                        $scope.isSendingRequest = false;
                        $state.go("survey.question", { surveyId: surveyId })
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

        function getSurveyTemplate() {
            $http.get("AddSurvey/GetSurveyTemplates", {
            }).success(function (response) {
                if (response.success) {
                    $scope.surveyTemplates = response.data;
                    if ($scope.surveyTemplates.length == 0) {
                        $scope.hasTemplate = true;
                    } else {
                        $scope.hasTemplate = false;
                    }

                    $scope.checkedSurvey = response.data[0];
                    getSessions($stateParams.id);
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

        $scope.isAccordion = function (a) {
            getTemplateDescriptionAndMessage();
            $scope.accordion = a + 1;
        }

        $scope.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };



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
            $state.go('class.activity');
        }

        $scope.getcurrentDate = function () {
            return Date.now();
        }

        $scope.removeSurveyTemplate = function (surveyId) {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'OK',
                headerText: 'Delete Feedback Template',
                bodyText: 'Are you sure you want to delete this feedback?'
            };
            ModalService.showModal({}, modalOptions).then(function (result) {
                $http.post("AddSurvey/DeleteSurveyTemplate", {
                    surveyId: surveyId
                }).success(function (response) {
                    if (response.success) {
                        getSurveyTemplate();
                        ModalService.showModal({}, {
                            headerText: 'Delete Feedback Template',
                            bodyText: 'Feedback template is deleted successfully'
                        });
                    } else {
                        ModalService.showModal({}, {
                            headerText: 'Error',
                            bodyText: 'Deleting has failed'
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

        $scope.preview = function (surveyId) {
            var url = "#/viewsurveytemplate/" + surveyId;
            var win = $window.open(url, '_blank');
            win.focus();
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
                    $scope.sessions[0].StartTime = response.data[0].StartTime;
                    $scope.sessions[0].EndTime = response.data[response.data.length - 1].EndTime;
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

                    $scope.newSurvey.StartTime = addDate(currentDate, "minute", 5);
                    $scope.newSurvey.EndTime = addDate($scope.newSurvey.StartTime, "day", 3);
                }
            }
        }

        function getTemplateDescriptionAndMessage() {
            $scope.newSurvey.Description = $scope.checkedSurvey.Description;
            $scope.newSurvey.ThankYou = $scope.checkedSurvey.ThankYou;
            $scope.newSurvey.SurveyType = $scope.checkedSurvey.SurveyType;

            if ($scope.newSurvey.SurveyType == 0) {
                $scope.newSurvey.SurveyType = "";
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

        var newSurveyType = "";
        var newDescription = "";
        var newThanks = "";
        $scope.isNewSurvey = function (inputValue) {
            $scope.isCopySurvey = inputValue;
            if (inputValue) {
                $scope.newSurvey.SurveyType = newSurveyType;
                $scope.newSurvey.Description = newDescription;
                $scope.newSurvey.ThankYou = newThanks;
            }
            else {
                newSurveyType = $scope.newSurvey.SurveyType;
                newDescription = $scope.newSurvey.Description;
                newThanks = $scope.newSurvey.ThankYou;
                getTemplateDescriptionAndMessage();
            }
        }
    }]);