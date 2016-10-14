'use strict';

/**
 * @ngdoc overview
 * @name mainApp
 * @description
 * # mainApp
 *
 * Main module of the application.
 */
angular.module('mainApp', [
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'LocalStorageModule',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'ngFileUpload',
    'angularMoment',
    'treeControl',
    'datatables',
    'textAngular',
    'remoteValidation',
    'ui.bootstrap.datetimepicker',
    'ui.calendar',
    'ui.bootstrap',
    'popoverToggle',
    'angular-svg-round-progress',
    'ngTagsInput',
    'as.sortable',
    'ui.bootstrap',
    ])
    .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('ls');
    }])


/**
 * $http interceptor.
 * On 401 response, redirect to Login page
 */
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push(
            ['$q', '$rootScope', '$injector',
            function ($q, $rootScope, $injector) {

                return {
                    responseError: function (response) {
                        // Need to use $injector.get to bring in $state and AuthService
                        // or else we get circular dependency error
                        var $state = $injector.get('$state');
                        var AuthService = $injector.get('AuthService');

                        if (response && response.status === 401) {
                            AuthService.clearCredential();
                            $state.go('login');
                        } else if (response && response.status === 404) {
                            window.location.href = "/404.html";
                        }

                        return $q.reject(response);
                    }
                };
        }]);
    }])

    .config(function(ErrorMessagesProvider) {
        ErrorMessagesProvider.setErrorMessages({
            "required": " is required",
            "datetime": " is Jan 08, 2016 12:00",
            "lessCurrentDate": " can't less than current date",
            "negativeNumber": " is not 0 or negative number",
            "invalidNumber": "Number of seat is invalid",
            "existed": "Course ID already exists",
            "maxLength": "Maxlength of # is # character"
        });
    })

    //Initializing user when our app loads
    .run(['$rootScope', '$state', 'AuthService',
        function ($rootScope, $state, AuthService) {

        // $stateChangeStart is fired whenever the state changes. We use parameter
        // toState to hook into details about the state as it is changing
            $rootScope.$on('$stateChangeStart', function (event, toState) {
                var user = JSON.parse(localStorage.getItem('user'));
                // If there is any user data in local storage then the user is quite
                // likely authenticated. If their session is expired, or if they are
                // otherwise not actually authenticated, they will be redirected to
                // the auth state because of the rejected request anyway
                if (user) {

                    AuthService.setCredential(user);

                    if (toState.name === "login") {
                        event.preventDefault();
                        $state.go('upcomingcourse');
                    }
                }

                var authorizedRoles = toState.data.authorizedRoles;

                if (!AuthService.isAuthorized(authorizedRoles)) {
                    event.preventDefault();
                    AuthService.clearCredential();
                    $state.go('login');
                }
            });
    }]);