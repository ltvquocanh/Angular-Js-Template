'use strict';
angular.module('mainApp').controller('Survey',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal',
        'ModalService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'AuthService', 'USER_ROLES',
    function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal,
        ModalService, DTOptionsBuilder, DTColumnDefBuilder, AuthService, USER_ROLES) {

        var vm = this;

        init();

        $scope.switchTo = function (route) {
            $scope.route = route;
            $state.go(route, { id: $stateParams.surveyId });
        }

        function init() {
            $scope.route = $state.current.name;
            $scope.surveyId = $stateParams.surveyId;
            $scope.survey = {};
            getSurvey($scope.surveyId);
        }

        function getSurvey(surveyId) {
            $http.get("Survey/GetSurvey", {
                params: { surveyId: surveyId }
            }).success(function (response) {
                if (response.success) {
                    $scope.survey = response.data;
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

        $scope.hasViewPermission = function () {
            return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                            USER_ROLES.TTC_MANAGER]);
        }

    }]);