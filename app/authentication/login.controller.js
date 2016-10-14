'use strict';
angular.module('mainApp').controller('Login',
    ['$scope', '$rootScope', '$state', '$http', 'cfpLoadingBar', 'AuthService',
        function ($scope, $rootScope, $state, $http, cfpLoadingBar, AuthService) {

    init();
    function init() {
        if (!AuthService.isAuthenticated()) {
            $http.get("Home/CheckCurrentUser")
                .success(function (response) {
                    if (response.success) {
                        AuthService.setCredential(response.data);
                        $state.go('upcomingcourse');
                    } else {
                        return null;
                    }
                })
                .error(function (response) {
                    return null;
                });
        }
    }

    $scope.login = function (loginForm) {

        if (loginForm.$valid) {
            var credential = {
                username: $scope.username,
                password: $scope.password
            }

            AuthService.login(credential).then(function (response) {
                // login is successful, redirect to default route
                $rootScope.isTrainer = false;
                $http.get("Class/isTrainer")
                               .success(function (response) {
                                   if (response.success) {
                                       $rootScope.isTrainer = response.data;
                                   } else {
                                       ModalService.showModal({}, {
                                           headerText: 'Error',
                                           bodyText: response.message
                                       });
                                   }
                               }).error(function (response) {
                                   if (response.message) {
                                       ModalService.showModal({}, {
                                           headerText: 'Error',
                                           bodyText: response.message
                                       });
                                   }
                               });

                $http.get("Course/GetDropdownList")
                       .success(function (response) {
                           if (response.success) {
                               $rootScope.trainingMethods = response.data.trainingMethods;
                               $rootScope.assessmentMethods = response.data.assessmentMethods;
                           }
                       }).error(function (response) {
                           ModalService.showModal({}, {
                               headerText: 'Error',
                               bodyText: response.message
                           });
                       });

                $state.go('upcomingcourse');
            }, function (response) {
                $scope.errorMessage = response.data.message;
            });
        }

        
        
    }
    
}]);
