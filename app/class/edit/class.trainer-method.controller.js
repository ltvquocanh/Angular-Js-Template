'use strict';
angular.module('mainApp').controller('ClassTrainerMethod',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', 'ModalService', 'moment', 'AuthService', 'USER_ROLES', 'SETTINGS',
function ($scope, $http, cfpLoadingBar, $state, $stateParams, ModalService, moment, AuthService, USER_ROLES, SETTINGS) {

    var vm = this;
    init();

    function init() {
        $scope.$parent.route = $state.current.name;
        $scope.class = {};
        $scope.classTrainers = [null];
        $scope.isCalendarOpen = false;
        $scope.isSendingRequest = false;
        $scope.isCapacityErrorMin = false;
        $scope.isCapacityDecimal = false;
        $scope.isCancel = false;
        $scope.currentDate = moment(Date.now()).format(SETTINGS.DATEFORMAT);
        getClassById();
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

    function getClassById() {
        if ($stateParams.id != "") {
            $http.get("ClassTrainerMethod/GetClassById", {
                params: {
                    classID: $stateParams.id,
                },
            }).success(function (response) {
                if (response.success) {
                    $scope.class = response.data.classInfo;
                    if ($scope.hasEditClassPermission() && !$scope.isCancel && !$scope.isClassDone) {
                        $scope.class.Methodology = $scope.class.Methodology.replace(/<br *\/?>/gi, '\n');
                    }
                    $scope.class.RegistrationDueTime = moment($scope.class.RegistrationDueTime)
                                                       .format(SETTINGS.DATEFORMAT);
                    if ($scope.class.StartTime != null) {
                        $scope.class.StartTime = moment($scope.class.StartTime)
                                                 .format(SETTINGS.DATEFORMAT);
                    }

                    if ($scope.class.ClassTrainers.length) {
                        $scope.classTrainers = $scope.class.ClassTrainers;

                        if ($scope.hasEditClassPermission() && !$scope.isCancel && !$scope.isClassDone) {
                            for (var i = 0; i < $scope.classTrainers.length; i++) {
                                $scope.classTrainers[i].Introduction =
                                    $scope.classTrainers[i].Introduction.replace(/<br *\/?>/gi, '\n');
                            }
                        }
                    }

                    $scope.allUsers = [];
                    for (var i = 0; i < response.data.users.length; i++) {
                        var user = {
                            TrainerId: response.data.users[i].Id,
                            FullName: response.data.users[i].FullName,
                            Username: response.data.users[i].Username,
                        };
                        $scope.allUsers.push(user);
                    }
                    getClassesByCourseIdForEditClass();
                    isCancel($scope.class.Status);
                    isClassDone($scope.class);
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
    }

    $scope.openCalendar = function (e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.isCalendarOpen = true;
    };

    $scope.save = function (editClassForm) {
        if ($scope.class.StartTime <= $scope.currentDate ) {
            if (editClassForm.$valid && !$scope.isCapacityDecimal) {
                for (var i = 0; i < $scope.classTrainers.length; i++) {
                    if (editClassForm['trainerName' + i].$error.duplicate) {
                        return;
                    }
                }

                var currentDate = Date.now()
                currentDate = moment(Date.now()).format(SETTINGS.DATEFORMAT);

                if (!moment.isDate($scope.class.RegistrationDueTime)) {
                    $scope.class.RegistrationDueTime = new Date($scope.class.RegistrationDueTime.replace("-", ""));
                }
                if (!moment.isDate(currentDate)) {
                    currentDate = new Date(currentDate.replace("-", ""));
                }

                $scope.isSendingRequest = true;
                $http.post("ClassTrainerMethod/UpdateClass", {
                    classDto: $scope.class,
                    classTrainerDtos: $scope.classTrainers,
                    currentDate: currentDate
                }).success(function (response) {
                    $scope.isSendingRequest = false;
                    ModalService.showModal({}, {
                        headerText: 'Edit Class',
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
        } else {
            if (editClassForm.$valid && $scope.isPastDate() && !$scope.isLessThanStartTime()
            && !$scope.isCapacityDecimal) {
                for (var i = 0; i < $scope.classTrainers.length; i++) {
                    if (editClassForm['trainerName' + i].$error.duplicate) {
                        return;
                    }
                }

                var currentDate = Date.now()
                currentDate = moment(Date.now()).format(SETTINGS.DATEFORMAT);

                if (!moment.isDate($scope.class.RegistrationDueTime)) {
                    $scope.class.RegistrationDueTime = new Date($scope.class.RegistrationDueTime.replace("-", ""));
                }
                if (!moment.isDate(currentDate)) {
                    currentDate = new Date(currentDate.replace("-", ""));
                }

                $scope.isSendingRequest = true;
                $http.post("ClassTrainerMethod/UpdateClass", {
                    classDto: $scope.class,
                    classTrainerDtos: $scope.classTrainers,
                    currentDate: currentDate
                }).success(function (response) {
                    $scope.isSendingRequest = false;
                    ModalService.showModal({}, {
                        headerText: 'Edit Class',
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

    }

    $scope.addClassTrainer = function () {
        $scope.classTrainers.push(null);
    };

    $scope.removeClassTrainer = function (index, editClassForm) {
        $scope.classTrainers.splice(index, 1);
        for (var i = index; $scope.classTrainers.length > i; i++) {
            editClassForm['trainerName' + i].$error.duplicate
                = isClassTrainerDuplicated($scope.classTrainers[i]);
        }
    }

    $scope.onBlur = function (index, classTrainerElement) {
        var trainerName = document.getElementById('classTrainer' + index).value;
        var trainerEntity = $scope.classTrainers[index];
        var isEmpty = false;

        if (!trainerName || /^\s*$/.test(trainerName)) {
            isEmpty = true;
        } else {
            if (typeof (trainerEntity) == 'undefined') {
                isEmpty = true;
            }
        }
        classTrainerElement.$error.required = isEmpty;
        if (isEmpty && classTrainerElement.$error.duplicate) {
            classTrainerElement.$error.duplicate = false;
        }
    };

    $scope.onSelect = function (trainer, index, classTrainerElement) {
        classTrainerElement.$error.duplicate = false;
        classTrainerElement.$error.required = false;
        classTrainerElement.$error.duplicate = isClassTrainerDuplicated(trainer);

        if (classTrainerElement.$error.duplicate) {
            classTrainerElement.$error.required = false;
        }

        if (classTrainerElement.$error.required) {
            classTrainerElement.$error.duplicate = false;
        }
    };

    function isClassTrainerDuplicated(trainer) {
        var isClassTrainerDuplicated = false;
        var countId = 0;
        for (var i = 0; i < $scope.classTrainers.length; i++) {
            if ($scope.classTrainers[i] &&
                $scope.classTrainers[i].TrainerId == trainer.TrainerId) {
                countId++;
                if (countId > 1) {
                    isClassTrainerDuplicated = true;
                    return isClassTrainerDuplicated;
                }
            }
        }
        return isClassTrainerDuplicated;
    }

    $scope.hasEditClassPermission = function () {
        return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                        USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
    }

    $scope.isPastDate = function () {
        var registrationDueTime = $scope.class.RegistrationDueTime;
        var currentDate = Date.now();
        currentDate = moment(currentDate).format(SETTINGS.DATEFORMAT);
        if (registrationDueTime != undefined) {
            if (!moment.isDate(registrationDueTime)) {
                registrationDueTime = new Date(registrationDueTime.replace("-", ""));
            }
            if (!moment.isDate(currentDate)) {
                currentDate = new Date(currentDate.replace("-", ""));
            }
        }

        if (registrationDueTime < currentDate) {
            return false;
        }
        return true;
    }

    $scope.isClassOpen = function () {
        if ($scope.class.StartTime != undefined) {
            var startTime = $scope.class.StartTime;
            var currentDate = Date.now();
            currentDate = moment(currentDate).format(SETTINGS.DATEFORMAT);
            if (startTime != undefined) {
                if (!moment.isDate(startTime)) {
                    startTime = new Date(startTime.replace("-", ""));
                }
                if (!moment.isDate(currentDate)) {
                    currentDate = new Date(currentDate.replace("-", ""));
                }
            }

            if (currentDate < startTime) {
                return false;
            }
            return true;
        }
        else {
            return false;
        }
    }

    $scope.isLessThanStartTime = function () {
        if ($scope.class.StartTime != undefined) {
            var registrationDueTime = $scope.class.RegistrationDueTime;
            var startTime = $scope.class.StartTime;
            if (registrationDueTime != undefined) {
                if (!moment.isDate(registrationDueTime)) {
                    registrationDueTime = new Date(registrationDueTime.replace("-", ""));
                }
                if (!moment.isDate(startTime)) {
                    startTime = new Date(startTime.replace("-", ""));
                }
            }

            if (registrationDueTime < startTime) {
                return false;
            }
            return true;
        }
        else {
            return false;
        }
    }

    function isCancel(classStatus) {
        if (classStatus == "Cancelled") {
            $scope.isCancel = true
        } else {
            $scope.isCancel = false
        }
    }

    function isClassDone(aClass) {
        var now = Date.now();
        if (aClass.EndTime != null) {
            aClass.EndTime = parseInt(aClass.EndTime.substr(6));
            if (aClass.EndTime < now) {
                $scope.isClassDone = true;
            } else {
                $scope.isClassDone = false;
            }
        }
    }

    $scope.hasViewClassPermission = function () {
        return AuthService.isAuthorized([USER_ROLES.TTC_CORDINATOR]);
    }

    function getClassesByCourseIdForEditClass() {
        $http.get("ClassTrainerMethod/GetClassesByCourseIdForEditClass", {
            params: {
                courseId: $scope.class.CourseId,
                classId: $scope.class.Id
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