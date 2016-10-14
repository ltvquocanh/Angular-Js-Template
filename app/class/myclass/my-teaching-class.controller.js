'use strict';
angular.module('mainApp').controller('MyTeachingClasses',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', '$filter', 'ModalService', 'SETTINGS', 'CLASS_STATUS',
        function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal, $filter, ModalService, SETTINGS, CLASS_STATUS) {
         
            $scope.getNextSession = function (myClass) {
                var currentDate = new Date();
                for (var i = 0; i < myClass.ClassSessions.length; i++) {
                    if (moment(myClass.ClassSessions[i].StartTime).unix() > moment(currentDate).unix()) {
                        return myClass.ClassSessions[i];
                    }
                }
            }

            $scope.getColorByClassStatus = function (myClass) {
                if (myClass.Status == CLASS_STATUS.Cancelled) {
                    return ["Cancelled","item-background-cancel-color"];
                }
                var currentDate = new Date();
                if (moment(currentDate).unix() < moment(myClass.StartTime).unix()) {
                    myClass.Status = CLASS_STATUS.NotStarted;
                    return ["Up Coming", "item-background-up-coming-color"];
                }
                else {
                    if (moment(currentDate).unix() > moment(myClass.EndTime).unix()) {
                        myClass.Status = CLASS_STATUS.Done;
                        return ["Done","item-background-done-color"];
                    }
                    else {
                        myClass.Status = CLASS_STATUS.OnGoing;
                        return ["On-going","item-background-on-going-color"];
                    }
                }
            }

            $scope.getMyClasses = function(courseName) {
                $http.get("Class/GetMyTeachingClasses", {
                    params: {
                        courseName: courseName,
                    },
                })
                    .success(function (response) {
                        if (response.success) {
                            $scope.myClasses = response.data;
                            angular.forEach($scope.myClasses, function (myClass, index) {
                                myClass.ClassSessions.sort(function (a, b) {
                                    return moment(a.StartTime).unix() - moment(b.StartTime).unix();
                                });
                                
                                angular.forEach(myClass.ClassTrainers, function (classTrainer, key) {
                                    if (classTrainer.Trainer.IsExternal == true) {
                                        if (classTrainer.Avatar != null) {
                                            classTrainer.Avatar = "Uploads/ExternalUserImages/" + classTrainer.Avatar;
                                        } else {
                                            classTrainer.Avatar = "Uploads/CourseImages/DefaultTrainerAvatar.jpg";
                                        }
                                    }
                                });
                            });
                        }
                        else {
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
              $scope.getMyClasses(null);

        }]);
