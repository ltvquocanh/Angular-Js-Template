'use strict';
angular.module('mainApp').controller('AddClass',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', 'ModalService', 'moment',
function ($scope, $http, cfpLoadingBar, $state, $stateParams, ModalService, moment) {

    var vm = this;

    init();

    function init() {
        $scope.class = {};
        $scope.classTrainers = [null];
        $scope.isCapacityErrorMin = false;
        $scope.isCapacityDecimal = false;

        getAllActiveUsers();
        getClassesByCourseId();
    }

    $scope.onCapacityChange = function () {
        if ($scope.class.Capacity <= 0) {
            $scope.isCapacityErrorMin = true;
        } else {
            $scope.isCapacityErrorMin = false;

            if ($scope.class.Capacity != null &&
            $scope.class.Capacity - parseInt($scope.class.Capacity) != 0) {
                $scope.isCapacityDecimal = true;
            } else {
                $scope.isCapacityDecimal = false;
            }
        }
    }

    $scope.onBlur = function (index, classTrainerElement) {
        var trainerName = document.getElementById('classTrainer' + index).value;
        var classTrainerEntity = $scope.classTrainers[index];
        var isEmpty = false;

        if (!trainerName || /^\s*$/.test(trainerName)) {
            isEmpty = true;
        } else {
            if (typeof (classTrainerEntity) == 'undefined') {
                isEmpty = true;
            }
        }
        classTrainerElement.$error.required = isEmpty;
        if (isEmpty && classTrainerElement.$error.duplicate) {
            classTrainerElement.$error.duplicate = false;
        }
    };

    $scope.onSelect = function (classTrainer, index, classTrainerElement) {
        classTrainerElement.$error.duplicate = false;
        classTrainerElement.$error.required = false;
        classTrainerElement.$error.duplicate = isClassTrainerDuplicated(classTrainer);

        if (classTrainerElement.$error.duplicate) {
            classTrainerElement.$error.required = false;
        }

        if (classTrainerElement.$error.required) {
            classTrainerElement.$error.duplicate = false;
        }
    };

    function isClassTrainerDuplicated(classTrainer) {
        var isClassTrainerDuplicated = false;
        var countId = 0;
        for (var i = 0; i < $scope.classTrainers.length; i++) {
            if ($scope.classTrainers[i] &&
                $scope.classTrainers[i].TrainerId == classTrainer.TrainerId) {
                countId++;
                if (countId > 1) {
                    isClassTrainerDuplicated = true;
                    return isClassTrainerDuplicated;
                }
            }
        }
        return isClassTrainerDuplicated;
    }

    $scope.isOpen = false;

    $scope.openCalendar = function (e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.isOpen = true;
    };

    $scope.save = function (newClassForm) {
        if (newClassForm.$valid && isPastDate() && !$scope.isCapacityDecimal) {
            for (var i = 0; i < $scope.classTrainers.length; i++) {
                if (newClassForm['trainerName' + i].$error.duplicate) {
                    return;
                }
            }
            $scope.isSendingRequest = true;
            $scope.class.CourseId = $stateParams.id;
            $http.post("AddClass/AddClass", {
                classDto: $scope.class,
                classTrainerDtos: $scope.classTrainers
            }).success(function (response) {
                $scope.newClassId = response.data;
                ModalService.showModal({}, {
                    headerText: 'Add New Class',
                    bodyText: response.message,
                });
                $state.go('class.trainermethod', { id: $scope.newClassId });
                $scope.isSendingRequest = false;
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
                $scope.isSendingRequest = false;
            });
        }
    }

    $scope.addClassTrainer = function () {
        $scope.classTrainers.push(null);
    };

    $scope.removeClassTrainer = function (index, newClassForm) {
        $scope.classTrainers.splice(index, 1);
        for (var i = index; $scope.classTrainers.length > i; i++) {
            newClassForm['trainerName' + i].$error.duplicate
                = isClassTrainerDuplicated($scope.classTrainers[i]);
        }
    }

    function getAllActiveUsers() {
        $http.get("AddClass/GetAllActiveUsers")
                .success(function (response) {
                    if (response.success) {
                        $scope.allUsers = [];
                        for (var i = 0; i < response.data.length; i++) {
                            var user = {
                                TrainerId: response.data[i].Id,
                                FullName: response.data[i].FullName,
                                Username: response.data[i].Username,
                            };

                            $scope.allUsers[i] = user;
                        }
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

    $scope.cancel = function () {
        $state.go('course.class');
    }

    $scope.getcurrentDate = function () {
        return Date.now();
    }

    function isPastDate() {
        var registrationDueTime = $scope.class.RegistrationDueTime;
        var currentDate = Date.now();

        if (registrationDueTime < currentDate) {
            return false;
        }
        return true;
    };

    function getClassesByCourseId() {
        $http.get("AddClass/GetClassesByCourseId", {
            params: {
                courseId: $stateParams.id,
            },
        }).success(function (response) {
            if (response.success) {
                $scope.allClassOfCourse = response.data;
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


