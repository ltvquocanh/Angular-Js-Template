'use strict';
angular.module('mainApp').controller('CourseCalendar',
    ['$scope','$rootScope', '$http', 'cfpLoadingBar', '$state', '$stateParams', 'ModalService', 'moment', '$compile', '$timeout', 'uiCalendarConfig', '$sce', '$uibPosition','AuthService','USER_ROLES',
function ($scope, $rootScope, $http, cfpLoadingBar, $state, $stateParams, ModalService, moment, $compile, $timeout, uiCalendarConfig, $sce, $uibPosition, AuthService, USER_ROLES) {

    var vm = this;
    var startDate;
    var endDate;
    var isNotInit;
    var sessions = {};

    init();
    function init() {
        $scope.$parent.menuRoute = $state.current.name;
        var date = new Date();
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        isNotInit = false;
        $scope.eventSource = {};
        sessions = {};
        $scope.eventSources = [];
        $scope.tooltipContent = {};

        $scope.events = [];

        getSessionsByDateRange();
    }

    function getSessionsByDateRange() {
        $http.get("ClassSession/GetSessionsByDateRange", {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        })
       .success(function (response) {
           if (response.success) {
               sessions = response.data;
               var currentDate = new Date(Date.now());
               angular.forEach(sessions, function (session) {
                   $scope.events.push(session);
               });
               isNotInit = true;
           } else {
               ModalService.showModal({}, {
                   headerText: 'Error',
                   bodyText: response.message
               });
           }
       })
       .error(function (response) {
           if (response.message) {
               ModalService.showModal({}, {
                   headerText: 'Error',
                   bodyText: response.message
               });
           }
       });
    }

    $scope.eventRender = function (event, element, view) {
        $scope.tooltipContent[event.Id] = $sce.trustAsHtml(event.TooltipAsHtml); //$sce: service for tooltip has html tag.

        $scope.eventSource = {
            className: 'gcal-event',
            currentTimezone: 'Vietnam'
        };

        var placement = '';
        if (event.DayOfWeek == 'Friday' || event.DayOfWeek == 'Saturday') {
            placement = 'left';
        } else {
            placement = 'right';
        }

        element.attr({
            'ng-class': "{'registration-class':" + (moment(event.RegistrationDueTime).isAfter(Date.now()) && !event.IsCancel) + '}',
            'tooltip-placement': placement,
            'tooltip-class': 'course-calendar-tooltip',
            'uib-tooltip-html': 'tooltipContent[' + event.Id + ']',
            'tooltip-append-to-body': true,
        });
        $compile(element)($scope);
    }

    $scope.onEventClick = function (date, jsEvent, view) {
        console.log("date", date);
        if (AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                  USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR])
            || ($rootScope.isTrainer && date.TrainerId == $rootScope.currentUser.Id)
          ) {
            var url = $state.href('class.activity', { id: date.ClassId });
            window.open(url, '_blank');
        }
        else {
            var url = $state.href('viewcourse', { id: date.CourseId });
            window.open(url, '_blank');
        }
    };

    $scope.uiConfig = {
        calendar: {
            editable: false,
            header: {
                left: '',
                center: 'title',
                right: 'today prev,next',
            },
            dayNamesShort: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            eventRender: $scope.eventRender,
            eventClick: $scope.onEventClick,
        }
    }

    //event switch month
    $scope.eventsF = function (start, end, timezone, callback) {
        if (isNotInit) {
            startDate = moment(start).format('YYYY-MM-DD');
            endDate = moment(end).format('YYYY-MM-DD');
            var start = new Date(startDate);
            var end = new Date(endDate);
            sessions = {};

            $http.get("ClassSession/GetSessionsByDateRange", {
                params: {
                    startDate: start,
                    endDate: end
                }
            })
            .success(function (response) {
                if (response.success) {
                    sessions = response.data;
                    var eventsCallback = [];
                    angular.forEach(sessions, function (session) {
                        eventsCallback.push(session);
                    });
                    callback(eventsCallback);
                } else {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                }
            })
            .error(function (response) {
                if (response.message) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                }
            });
        };
    }

    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];

}]);