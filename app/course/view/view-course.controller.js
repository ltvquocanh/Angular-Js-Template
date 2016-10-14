'use strict';
angular.module('mainApp').controller('ViewCourse',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', 'ModalService', 'moment', '$modal',
        'AuthService', 'USER_ROLES', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DEFAULT_DIACRITICS',
        function ($scope, $http, cfpLoadingBar, $state, $stateParams, ModalService, moment, $modal,
            AuthService, USER_ROLES, DTOptionsBuilder, DTColumnDefBuilder, DEFAULT_DIACRITICS) {

            var vm = this;

            init();
            $scope.managerNumber = 0;
            $scope.membersNumber = 0;
            $scope.maxDate = 253402275599997;
            $scope.notAvailableClass = 0;

            function init() {
                $scope.courseId = $stateParams.id;
                $scope.now = new Date();
                $scope.progressBarColor = {
                    "half": "#00B15D",
                    "almostFull": "#F0B51B",
                    "full": "#CA5100"
                };

                $scope.showSumarryOption = {
                    isFullDetails: false,
                    title: "Full details",
                    limit: 300
                };

                getCourseById($scope.courseId);
                GetManagerOfCurrentUser();

            }

            function getCourseById(courseId) {
                $http.get("ViewCourse/GetClassesByCourse", {
                    params: { courseId: courseId }
                }).success(function (response) {
                    if (response.success == true) {
                        $scope.course = response.data.course;
                        $scope.courseClasses = response.data.classes;
                        $scope.registeredClasses = response.data.registeredClasses;
                        formatData();
                        coverClassView();
                        addStatusRegistrationToClass();

                        for (var j = 0; j < $scope.courseClasses.length; j++) {
                            checkRegistrationSession($scope.courseClasses[j]);
                            isTrainerOfClass($scope.courseClasses[j]);
                            for (var i = 0; i < $scope.courseClasses[j].ClassSessions.length; i++) {
                                checkStartTime($scope.courseClasses[j].ClassSessions)
                                if ($scope.courseClasses[j].ClassSessions[i].StartTime != null) {
                                    var startTime = $scope.courseClasses[j].ClassSessions[i].StartTime;
                                    $scope.courseClasses[j].ClassSessions[i].StartTime = parseInt(startTime.substr(6));
                                }
                                if ($scope.courseClasses[j].ClassSessions[i].EndTime != null) {
                                    var endTime = $scope.courseClasses[j].ClassSessions[i].EndTime;
                                    $scope.courseClasses[j].ClassSessions[i].EndTime = parseInt(endTime.substr(6));
                                }
                            }

                            for (var h = 0; h < $scope.courseClasses[j].ClassTrainers.length; h++) {
                                if($scope.courseClasses[j].ClassTrainers[h].Trainer.IsExternal == true){
                                    if ($scope.courseClasses[j].ClassTrainers[h].Avatar != null) {
                                        $scope.courseClasses[j].ClassTrainers[h].Avatar = "Uploads/ExternalUserImages/" + $scope.courseClasses[j].ClassTrainers[h].Avatar;
                                    } else {
                                        $scope.courseClasses[j].ClassTrainers[h].Avatar = "Uploads/CourseImages/DefaultTrainerAvatar.jpg";
                                    }
                                }
                            }
                        }

                        for (var x = 0; x < $scope.courseClasses.length; x++) {
                            //
                            $scope.courseClasses[x].StartTimeFormat = moment($scope.courseClasses[x].StartTime).format("MMM DD, YYYY");
                            $scope.courseClasses[x].EndTimeFormat = moment($scope.courseClasses[x].EndTime).format("MMM DD, YYYY");
                            $scope.courseClasses[x].RegistrationDueTimeFormat = moment($scope.courseClasses[x].RegistrationDueTime).format("MMM DD, YYYY");
                            //
                            var startTimeOfClass = $scope.courseClasses[x].StartTime;
                            $scope.courseClasses[x].StartTime = parseInt(startTimeOfClass.substr(6));
                            if ($scope.courseClasses[x].StartTime == $scope.maxDate
                                || $scope.courseClasses[x].StartTime == null) {
                                $scope.notAvailableClass++;
                            }
                        }

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
                    history.back();
                });
            }

            function addStatusRegistrationToClass() {
                angular.forEach($scope.courseClasses, function (aClass, index) {
                    // begin outer Foreach
                    angular.forEach($scope.registeredClasses, function (registeredClass, index) {
                        //begin inner foreach
                        if (aClass.Id == registeredClass.ClassId) {
                            aClass.StatusRegistration = registeredClass.Status;
                        }

                    });// end inner forEach

                });// end outer Foreach

            }// end addStatusRegistrationToClass

            function formatData() {
                angular.forEach($scope.courseClasses, function (classInCourse, index) {

                    angular.forEach(classInCourse.ClassTrainers, function (classTrainer, index) {
                        classTrainer.Introduction = classTrainer.Introduction.replace(/\n/g, "<br />");
                    });

                });
            }

            $scope.searchFunction = function (registration) {
                if (!$scope.registrations.fullName ||
                     registration.FullName.toLowerCase().indexOf($scope.registrations.fullName.toLowerCase()) !== -1 ||
                     registration.FullNameNoneDiacritics.toLowerCase().indexOf($scope.registrations.fullName.toLowerCase()) !== -1 ||
                     registration.Username.toLowerCase().indexOf($scope.registrations.fullName.toLowerCase()) !== -1) {
                    return true;
                }
                return false;
            }


            $scope.showListRegistration = function (classId) {
                $scope.isSendingRequest = true;

                $http.get("ClassRegistration/GetRegistrations", {
                    params: {
                        classId: classId
                    }
                }).success(function (response) {

                    angular.forEach(response.data, function (registration, index) {
                        registration.FullNameNoneDiacritics = removeDiacritics(registration.FullName);
                    });

                    $scope.registrations = response.data;
                    $scope.isSendingRequest = false;
                    //show pop up
                    var modalInstance = $modal.open({
                        size: 'lg',
                        animation: true,
                        backdrop: 'static',
                        templateUrl: 'registrationList.html',
                        scope: $scope,
                        controller: [
                            '$modalInstance', function ($modalInstance) {

                                $scope.dtOptions = DTOptionsBuilder.newOptions()
                                                  .withOption('bFilter', false)
                                                  .withOption('bInfo', false)
                                                  .withOption('bPaginate', false)
                                                  .withOption('bScrollCollapse', false)
                                                  .withOption('bLengthChange', false)
                                                  .withOption('columnDefs', [{ "sortable": false, "targets": [0] }])
                                $scope.dtInstanceCallback = function (dtInstance) {
                                    dtInstance.DataTable.on('order.dt', function () {
                                        dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                                            cell.innerHTML = i + 1;
                                        });
                                    });
                                }

                                $scope.close = function () {
                                    $modalInstance.dismiss();
                                };
                            }
                        ]
                    });
                    // end pop up
                }).error(function (response) {
                    if (response.message) {
                        ModalService.showModal({}, {
                            headerText: 'Error',
                            bodyText: response.message
                        });
                    }
                    $scope.isSendingRequest = false;
                });
            }

            function coverClassView() {
                angular.forEach($scope.courseClasses, function (courseClass, index) {
                    $scope.courseClasses[index].RegistrationDueTime = new Date(parseInt(courseClass.RegistrationDueTime.substr(6)));
                    var rate = courseClass.RegistrationNumber / courseClass.Capacity;
                    var colorName;

                    if (rate <= 0.5) {
                        colorName = 'half';
                    } else if (rate > 0.5 && rate < 1) {
                        colorName = 'almostFull';
                    } else {
                        colorName = 'full';
                    }

                    $scope.courseClasses[index].color = $scope.progressBarColor[colorName];
                });
            }

            function increaseClassRegistrationNumber(classId) {
                angular.forEach($scope.courseClasses, function (courseClass, index) {
                    if (courseClass.Id === classId) {
                        $scope.courseClasses[index].RegistrationNumber++;
                    }
                });
            }

            function GetManagerOfCurrentUser() {
                $http.get("ViewCourse/GetManagerOfCurrentUser", {
                }).success(function (response) {
                    if (response.success) {
                        $scope.managers = response.data;
                        $scope.managerNumber = response.data.length;
                    }
                }).error(function (response) {
                    if (response.message) {
                        ModalService.showModal({}, {
                            headerText: 'Error',
                            bodyText: response.message
                        });
                    }
                });
            }

            function getListSessionIds(aClass) {
                var listSessionIds = [];
                angular.forEach(aClass.ClassSessions, function (session, index) {
                    if (session.Selected) {
                        listSessionIds.push(session.Id);
                    }
                });
                return listSessionIds;
            }
            function classRegisteredPosision(registeredClasses, classId) {
                for (var i = 0; i < $scope.registeredClasses.length; i++) {
                    if ($scope.registeredClasses[i].ClassId == classId) {
                        return i;
                    }
                }
                return i;
            }

            function checkRegistrationSession(aClass) {
                if ($scope.registeredClasses.length != 0) {
                    for (var i = 0; i < $scope.registeredClasses.length; i++) {
                        var k = classRegisteredPosision($scope.registeredClasses, aClass.Id);
                        //Check class has registered
                        if (k != $scope.registeredClasses.length) {
                            if ($scope.registeredClasses[k].RegiatrationSessions.length != 0) {
                                for (var j = 0; j < aClass.ClassSessions.length; j++) {
                                    if ($scope.registeredClasses[i].RegiatrationSessions.indexOf(aClass.ClassSessions[j].Id) != -1) {
                                        aClass.ClassSessions[j].Selected = true;
                                    };
                                }
                            } else {
                                for (var x = 0; x < aClass.ClassSessions.length; x++) {
                                    aClass.ClassSessions[x].Selected = true;
                                }
                                aClass.isCheckedAll = true;
                            }
                        }
                        else {
                            for (var x = 0; x < aClass.ClassSessions.length; x++) {
                                aClass.ClassSessions[x].Selected = true;
                            }
                            aClass.isCheckedAll = true;
                        }
                    }
                } else {
                    for (var x = 0; x < aClass.ClassSessions.length; x++) {
                        aClass.ClassSessions[x].Selected = true;
                    }
                    aClass.isCheckedAll = true;
                }
            }

            $scope.registerClass = function (aClass) {
                if (getListSessionIds(aClass).length != 0) {
                    GetManagerOfCurrentUser();
                    if ($scope.managerNumber > 1) {
                        var modalInstance = $modal.open({
                            animation: true,
                            backdrop: 'static',
                            templateUrl: 'registerClass.html',
                            scope: $scope,
                            controller: [
                                '$modalInstance', function ($modalInstance) {

                                    $http.get("ViewCourse/GetManagerOfCurrentUser", {
                                    }).success(function (response) {
                                        if (response.success) {
                                            $scope.managers = response.data;
                                        }
                                    }).error(function (response) {
                                        if (response.message) {
                                            ModalService.showModal({}, {
                                                headerText: 'Error',
                                                bodyText: response.message
                                            });
                                        }
                                    });

                                    $scope.manager = {}

                                    $scope.ok = function (registerClassForm) {
                                        if (getListSessionIds(aClass).length == aClass.ClassSessions.length) {
                                            var sessionIds = null;
                                        } else {
                                            sessionIds = getListSessionIds(aClass);
                                        }
                                        $scope.isSendingRequest = true;
                                        $http.post("ViewCourse/SelfRegisterClass", {
                                            classId: aClass.Id,
                                            manager: $scope.manager.fullName,
                                            sessionIds: sessionIds
                                        }).success(function (response) {
                                            if (response.success == true) {
                                                ModalService.showModal({}, {
                                                    headerText: 'Register Class',
                                                    bodyText: 'Class is registered successfully'
                                                });

                                                angular.forEach($scope.courseClasses, function (courseClass, index) {
                                                    //begin forEach
                                                    //updare StatusRegistration for current class which you have just registered.
                                                    if (courseClass.Id == aClass.Id) {
                                                        courseClass.StatusRegistration = response.data.Status;
                                                    }

                                                });// end forEach

                                                increaseClassRegistrationNumber(aClass.Id);
                                                $modalInstance.dismiss();
                                            } else {
                                                ModalService.showModal({}, {
                                                    headerText: 'Error',
                                                    bodyText: response.message
                                                });

                                            }
                                            $scope.isSendingRequest = false;
                                        }).error(function (response) {
                                            ModalService.showModal({}, {
                                                headerText: 'Error',
                                                bodyText: response.message
                                            });
                                            $scope.isSendingRequest = false;
                                        });
                                    }

                                    $scope.cancel = function () {
                                        $modalInstance.dismiss();
                                    };
                                }
                            ]
                        });
                    }
                    else {
                        var modalOptions = {
                            closeButtonText: 'Cancel',
                            actionButtonText: 'OK',
                            headerText: 'Register',
                            bodyText: 'Are you sure you want to register this class?'
                        };

                        ModalService.showModal({}, modalOptions).then(function (result) {
                            if (getListSessionIds(aClass).length == aClass.ClassSessions.length) {
                                var sessionIds = null;
                            } else {
                                sessionIds = getListSessionIds(aClass);
                            }
                            $http.post("ViewCourse/SelfRegisterClass", {
                                classId: aClass.Id,
                                sessionIds: sessionIds
                            }).success(function (response) {
                                if (response.success == true) {
                                    ModalService.showModal({}, {
                                        headerText: 'Register Class',
                                        bodyText: 'Class is registered successfully'
                                    });

                                    angular.forEach($scope.courseClasses, function (courseClass, index) {
                                        //begin forEach
                                        //updare StatusRegistration for current class which you have just registered.
                                        if (courseClass.Id == aClass.Id) {
                                            courseClass.StatusRegistration = response.data.Status;
                                        }

                                    });// end forEach

                                    increaseClassRegistrationNumber(aClass.Id);

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
                        });
                    }
                } else {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: 'You have to select at least one session',
                    });
                }
            }

            $scope.showMoreContent = function (showSumarryOption) {
                if (!showSumarryOption.isFullDetails) {
                    $scope.showSumarryOption.limit = $scope.course.Summary.length;
                    $scope.showSumarryOption.title = "Hide";
                    $scope.showSumarryOption.isFullDetails = true;
                } else {
                    $scope.showSumarryOption.limit = 300;
                    $scope.showSumarryOption.title = "Full details";
                    $scope.showSumarryOption.isFullDetails = false;
                }
            };

            $scope.hasAddClassPermission = function () {
                return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                                 USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
            }

            $scope.hasEditingCoursePermission = function () {
                return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                                 USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
            }

            $scope.hasEditClassPermission = function () {
                return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                                 USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
            }

            $scope.hasRegisterClassForYourTeamPermission = function () {
                return AuthService.isAuthorized([USER_ROLES.MANAGER]);
            }

            function isTrainerOfClass(aClass) {
                $http.get("ViewCourse/CheckIsTrainerOfClass", {
                    params: {
                        classId: aClass.Id,
                    }
                }).success(function (response) {
                    if (response.success) {
                        aClass.isTrainerOfClass = response.data;
                    }
                }).error(function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                });
            }

            $scope.registerClassForYourTeam = function (aClass) {
                if (getListSessionIds(aClass).length != 0) {
                    $scope.registeredMembers = [];
                    GetMemberOfManager(aClass);
                } else {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: 'You have to select at least one session',
                    });
                }
            }

            function GetMemberOfManager(aClass) {
                $http.get("ViewCourse/GetMemberOfManager", {
                    params: {
                        classId: aClass.Id,
                    }
                }).success(function (response) {
                    if (response.success) {
                        $scope.members = response.data;
                        for (var a = 0; a < response.data.length; a++) {
                            if (response.data[a].HasRegistration) {
                                $scope.registeredMembers.push(response.data[a]);
                            }
                        }
                        var modalInstance = $modal.open({
                            animation: true,
                            backdrop: 'static',
                            templateUrl: 'registerClassForYourTeam.html',
                            scope: $scope,
                            controller: [
                                '$modalInstance', 'filterFilter', '$cacheFactory',
                                function ($modalInstance, filterFilter, $cacheFactory) {

                                    $scope.loadTags = function ($query) {
                                        cache: true;
                                        var membersNotRegistered = $scope.members;
                                        return membersNotRegistered.filter(function (member) {
                                            return member.Username.toLowerCase().indexOf($query.toLowerCase()) != -1 && !member.HasRegistration;
                                        });
                                    };

                                    $scope.ok = function (registerClassForMemberForm) {
                                        if (registerClassForMemberForm.$valid) {
                                            if (getListSessionIds(aClass).length == aClass.ClassSessions.length) {
                                                var sessionIds = null;
                                            } else {
                                                sessionIds = getListSessionIds(aClass);
                                            }
                                            $http.post("ViewCourse/RegisterClassForTeam", {
                                                classId: aClass.Id,
                                                members: $scope.registeredMembers,
                                                sessionIds: sessionIds
                                            }).success(function (response) {
                                                if (response.success == true) {
                                                    var httpCache = $cacheFactory.get('$http');
                                                    httpCache.removeAll();

                                                    ModalService.showModal({}, {
                                                        headerText: 'Register Class',
                                                        bodyText: 'Class is registered successfully'
                                                    });
                                                    getCourseById($scope.courseId);
                                                    $modalInstance.dismiss();
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

                                    $scope.cancel = function () {
                                        var httpCache = $cacheFactory.get('$http');
                                        httpCache.removeAll();
                                        $modalInstance.dismiss();
                                    };
                                }
                            ]
                        })
                    }
                }).error(function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                });
            }

            var defaultDiacriticsRemovalMap = DEFAULT_DIACRITICS;

            function removeDiacritics(str) {
                for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
                    str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
                }
                return str;
            }

            $scope.availableClass = function () {
                if ($scope.courseClasses != undefined) {
                    return $scope.courseClasses.length - $scope.notAvailableClass;
                }
            }

            $scope.checkedAll = function (classInCourse) {
                angular.forEach(classInCourse.ClassSessions, function (session, index) {
                    session.Selected = classInCourse.isCheckedAll;
                });
            }

            $scope.optionToggled = function (classInCourse) {
                for (var i = 0; i < classInCourse.ClassSessions.length; i++) {
                    if (!classInCourse.ClassSessions[i].Selected) {
                        classInCourse.isCheckedAll = false;
                        return;
                    }
                }
                classInCourse.isCheckedAll = true;
            }

            $scope.isClassDone = function (classIncourse) {
                if (moment(classIncourse.EndTime).unix() > moment(new Date()).unix()) {
                    return false;
                }
                return true
            }

            function checkStartTime(classSession) {
                for (var i = 0; i < classSession.length; i++) {
                    if (classSession[0] != null)
                        $scope.checkStartTime = true;
                    else
                        $scope.checkStartTime = false;
                }
                return $scope.checkStartTime;
            }

            $scope.getStartTimeFirst = function (session) {
                if (session.StartTime != null) {
                    return session.StartTime;
                }
            }
        }]);
