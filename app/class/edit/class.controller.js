'use strict';
angular.module('mainApp').controller('Class',
    ['$scope','$rootScope', '$http', 'cfpLoadingBar', '$state', '$stateParams', 'ModalService',
        'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'AuthService', 'USER_ROLES',
        function ($scope,$rootScope, $http, cfpLoadingBar, $state, $stateParams, ModalService,
            moment, DTOptionsBuilder, DTColumnDefBuilder, AuthService, USER_ROLES) {

        var vm = this;

        init();

        $scope.switchTo = function (route) {
            $scope.route = route;
            $state.go(route, { id: $scope.classId });
        }

        function init() {
            $scope.route = $state.current.name;
            $scope.classId = $stateParams.id;
            $scope.class = {};
            $rootScope.classId = $scope.classId;
            getClass($scope.classId);
        }

        function getClass(classId) {
            $http.get("Class/GetClass", {
                params: { classId: classId }
            }).success(function (response) {
                if (response.success) {
                    $scope.class = response.data;
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
        
        $scope.hasViewClassPermission = function () {
            return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                            USER_ROLES.TTC_MANAGER]);
        }
    }]);
