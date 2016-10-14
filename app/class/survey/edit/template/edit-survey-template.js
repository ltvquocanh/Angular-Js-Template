'use strict';
angular.module('mainApp').controller('EditSurveyTemplate',
    ['$scope', '$rootScope', '$http', 'cfpLoadingBar', '$filter', '$state', '$stateParams', 'ModalService',
        'Upload', 'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS', 'AuthService',
        'USER_ROLES', 'SURVEY_TYPE',
function ($scope, $rootScope, $http, cfpLoadingBar, $filter, $state, $stateParams, ModalService,
    Upload, moment, DTOptionsBuilder, DTColumnDefBuilder, SETTINGS, AuthService, USER_ROLES, SURVEY_TYPE) {

    var vm = this;
    init();

    function init() {
        $scope.$parent.route = $state.current.name;
        GetSurveyTemplate()
        $scope.editSurveyTemplate = {};
        $scope.surveyTypes = SURVEY_TYPE;
    }

    function GetSurveyTemplate() {
        $http.get("EditSurveyTemplate/GetSurveyTemplate", {
            params: {
                surveyId: $stateParams.surveyId
            }
        }).success(function (response) {
            if (response.success) {
                $scope.editSurveyTemplate = response.data;

                if ($scope.editSurveyTemplate.SurveyType == 0) {
                    $scope.editSurveyTemplate.SurveyType = "";
                }
            }
        }).error(function (response) {
            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: response.message
            });
        });
    }

    $scope.save = function (editSurveyTemplateForm) {
        if (editSurveyTemplateForm.$valid) {
            $scope.isSendingRequest = true;
            $http.post("EditSurveyTemplate/UpdateSurveyTemplate", {
                surveyTemplateDto: $scope.editSurveyTemplate,
            }).success(function (response) {
                $scope.isSendingRequest = false;
                ModalService.showModal({}, {
                    headerText: 'Edit Feedback Template',
                    bodyText: response.message
                });
                $scope.message = response.message;
            }).error(function (response) {
                $scope.isSendingRequest = false;
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
        }
    }

    $scope.cancel = function () {
        $state.go('class.addsurvey', { id: $rootScope.classId });
    }
}]);