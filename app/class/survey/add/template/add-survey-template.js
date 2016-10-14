'use strict';
angular.module('mainApp').controller('AddSurveyTemplate',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', '$window',
        'ModalService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS', 'SURVEY_TYPE',
    function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal, $window,
        ModalService, DTOptionsBuilder, DTColumnDefBuilder, SETTINGS, SURVEY_TYPE) {

        var vm = this;

        init();

        function init() {
            getSurveyTemplate();
            $scope.isCopySurvey = true;
            $scope.accordion = 1;
            $scope.checkedSurvey = {};
            $scope.addSurveyTemplate = {};
            $scope.surveyTypes = SURVEY_TYPE;
        }

        $scope.create = function (addSurveyTemplateForm) {
            var accordion = $scope.accordion;
            $scope.addSurveyTemplate.classId = $stateParams.id;
            if (addSurveyTemplateForm.$valid) {
                $scope.isSendingRequest = true;
                $scope.classId = $stateParams.id;
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
                    $scope.addSurveyTemplate.Pages = angular.copy($scope.surveyTemplates[accordion - 1].Pages);
                    $http.post("Survey/AddNewSurveyTemplate", {
                        surveyTemplateDto: $scope.addSurveyTemplate,
                        surveyTemplateId: $scope.checkedSurvey.Id,
                        classId: $scope.addSurveyTemplate.classId,
                    }).success(function (response) {
                        var surveyId = response.data;
                        ModalService.showModal({}, {
                            headerText: 'Add New Feedback Template',
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
                    $http.post("Survey/AddNewSurveyTemplate", {
                        surveyTemplateDto: $scope.addSurveyTemplate,
                        classId: $scope.addSurveyTemplate.classId,
                    }).success(function (response) {
                        var surveyId = response.data;
                        ModalService.showModal({}, {
                            headerText: 'Add New Feedback Template',
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

        $scope.isAccordion = function (a) {
            getTemplateDescriptionAndMessage();
            $scope.accordion = a + 1;
        }

        $scope.cancel = function () {
            window.history.back();
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

        $scope.removeSurveyTemplate = function (surveyId) {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'OK',
                headerText: 'Delete Feedback Template',
                bodyText: 'Are you sure you want to delete this feedback template?'
            };
            ModalService.showModal({}, modalOptions).then(function (result) {
                $http.post("AddSurvey/DeleteSurveyTemplate", {
                    surveyId: surveyId
                }).success(function (response) {
                    if (response.success) {
                        angular.forEach($scope.surveyTemplates, function (survey, key) {
                            if (survey.Id == surveyId) {
                                $scope.surveyTemplates.splice(key, 1);
                            }
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

        $scope.preview = function (surveyId) {
            var url = "#/viewsurveytemplate/" + surveyId;
            var win = $window.open(url, '_blank');
            win.focus();
        }

        function getTemplateDescriptionAndMessage() {
            $scope.addSurveyTemplate.Description = $scope.checkedSurvey.Description;
            $scope.addSurveyTemplate.ThankYou = $scope.checkedSurvey.ThankYou;
            $scope.addSurveyTemplate.SurveyType = $scope.checkedSurvey.SurveyType;

            if ($scope.addSurveyTemplate.SurveyType == 0) {
                $scope.addSurveyTemplate.SurveyType = "";
            }
        }

        var newSurveyTypeTemplate = "";
        var newDescriptionTemplate = "";
        var newThanksTemplate = "";
        $scope.isNewSurvey = function (inputValue) {
            $scope.isCopySurvey = inputValue;
            if (inputValue) {
                $scope.addSurveyTemplate.SurveyType = newSurveyTypeTemplate;
                $scope.addSurveyTemplate.Description = newDescriptionTemplate;
                $scope.addSurveyTemplate.ThankYou = newThanksTemplate;
            }
            if (!inputValue) {
                newSurveyTypeTemplate = $scope.addSurveyTemplate.SurveyType;
                newDescriptionTemplate = $scope.addSurveyTemplate.Description;
                newThanksTemplate = $scope.addSurveyTemplate.ThankYou;
                getTemplateDescriptionAndMessage();
            }
        }
    }]);