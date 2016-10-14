'use strict';
angular.module('mainApp').controller('Course',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams','ModalService',
        function ($scope, $http, cfpLoadingBar, $state, $stateParams, ModalService) {

    var vm = this;

    init();

    $scope.switchTo = function (route) {
        $scope.route = route;
        $state.go(route, { id: $scope.courseId });
    }

    function init() {
        $scope.route = $state.current.name;
        $scope.courseId = $stateParams.id;
        getCourseById($scope.courseId);
    }


    function getCourseById(courseId) {
        $http.get("Course/GetCourse", {
            params: { courseId: courseId }
        }).success(function (response) {
            if (response.success == true) {
                $scope.course = response.data;
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


    
    
}]);
