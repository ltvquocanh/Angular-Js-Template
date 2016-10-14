'use strict';
angular.module('mainApp').controller('CourseSession',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', 'ModalService', 'DTOptionsBuilder', 'DTColumnDefBuilder',
    function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal, ModalService, DTOptionsBuilder, DTColumnDefBuilder) {

        var vm = this;

        init();

        function init() {
            $scope.$parent.route = $state.current.name;
            $scope.dtOptions = DTOptionsBuilder.newOptions()
              .withOption('bFilter', false)
              .withOption('bInfo', false)
              .withOption('bPaginate', false)
              .withOption('bLengthChange', false)
              .withOption('columnDefs', [{ "sortable": false, "targets": [0, 3] }])

            $scope.dtColumnDefs = [
               DTColumnDefBuilder.newColumnDef(0).notSortable(),
               DTColumnDefBuilder.newColumnDef(3).notSortable()
            ];

            $scope.dtInstanceCallback = function (dtInstance) {

                dtInstance.DataTable.on('order.dt', function () {
                    dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
                });
            }

            $scope.courseId = $stateParams.id;
            getCourseSessions();
        }


        function getCourseSessions() {
            if ($scope.courseId != "") {
                $http.get("CourseSessions/GetCourseSessions", {
                    params: {
                        courseId: $scope.courseId,
                    },
                }).success(function (response) {
                    if (response.success) {
                        $scope.sessions = response.data;
                    } else {
                        ModalService.showModal({}, {
                            headerText: 'Error',
                            bodyText: response.message
                        });
                    }
                })
           .error(function (response) {
               ModalService.showModal({}, {
                   headerText: 'Error',
                   bodyText: response.message
               });
           });
            }
        }

        function getCourseSession(sessionId) {
            var result = {};
            angular.forEach($scope.sessions, function (session, index) {
                if (session.Id == sessionId) {
                    result = session;
                }
            });
            return result;
        }

        $scope.delete = function (sessionId) {

            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'OK',
                headerText: 'Delete Session',
                bodyText: 'Are you sure you want to delete this session?'
            };

            ModalService.showModal({}, modalOptions).then(function (result) {
                $http.post("CourseSessions/DeleteCourseSession", {
                    sessionId: sessionId
                }).success(function (response) {
                    if (response.success) {
                        getCourseSessions();
                    } else {
                        ModalService.showModal({}, {
                            headerText: 'Error',
                            bodyText: response.message
                        });
                    }
                })
            .error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
            });

        }

        $scope.openModalEditSession = function (sessionId) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'editSessionDialog.html',
                scope: $scope,
                controller: [
                    '$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.isSendingRequest = false;
                        $scope.session = getCourseSession(sessionId);
                        $scope.sessionUpdate = angular.copy($scope.session);
                        $scope.isDurationValid = true;

                        $scope.checkMinDuration = function (number) {
                            var min = 0.1;
                            if (number != undefined) {
                                if (number < min) {
                                    $scope.isMinDuration = false;
                                    return false;
                                } else {
                                    $scope.isMinDuration = true;
                                    return true;
                                }
                            }
                        }

                        $scope.onDurationChange = function () {
                            if ($scope.sessionUpdate.Duration != undefined || $scope.sessionUpdate.Duration > 0) {
                                $scope.isDurationValid = true;
                            } else {
                                $scope.isDurationValid = false;
                            }
                        }

                        $scope.checkExistSessionName = function (sessionName) {
                            for (var i = 0; i < $scope.sessions.length; i++) {
                                if ($scope.sessions[i].Name == sessionName.trim()) {
                                    $scope.isExistSessionName = true;
                                }
                                else {
                                    $scope.isExistSessionName = false;
                                }
                            }
                        }

                        $scope.ok = function (editSessionForm) {
                            if (editSessionForm.$valid && $scope.isMinDuration && !$scope.isExistSessionName) {
                                $scope.isSendingRequest = true;
                                $http.post("CourseSessions/UpdateCourseSession", {
                                    sessionDto: $scope.sessionUpdate
                                }).success(function (response) {
                                    if (response.success) {
                                        $modalInstance.dismiss();
                                        ModalService.showModal({}, {
                                            headerText: 'Edit Session',
                                            bodyText: response.message
                                        });
                                        $state.go('course.session');
                                        getCourseSessions();
                                        $modalInstance.dismiss();
                                    } else {
                                        ModalService.showModal({}, {
                                            headerText: 'Error',
                                            bodyText: response.message
                                        });
                                    }
                                    $scope.isSendingRequest = false;
                                })
                        .error(function (response) {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                                bodyText: response.message
                            });
                            $scope.isSendingRequest = false;
                        });
                            }

                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };

                        $scope.sessionNameSetArgs = function (val, el, attrs, ngModel) {
                            return {
                                sessionName: val,
                                courseId: $scope.sessionUpdate.CourseId,
                                sessionId: sessionId
                            };
                        };
                    }
                ],
            });
        }

        $scope.openModalAddSession = function (courseId) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'addSessionDialog.html',
                scope: $scope,
                controller: [
                    '$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.isSendingRequest = false;
                        $scope.isDurationValid = false;

                        $scope.checkMinDuration = function (number) {
                            var min = 0.1;
                            if (number != undefined) {
                                if (number < min) {
                                    $scope.isMinDuration = false;
                                    return false;
                                } else {
                                    $scope.isMinDuration = true;
                                    return true;
                                }
                            }
                        }

                        $scope.onDurationChange = function () {
                            if ($scope.newSession.Duration <= 0 || $scope.newSession.Duration == undefined) {
                                $scope.isDurationValid = true;
                            } else {
                                $scope.isDurationValid = false;
                            }
                        }

                        $scope.checkExistSessionName = function (sessionName) {
                            for (var i = 0; i < $scope.sessions.length; i++) {
                                if ($scope.sessions[i].Name == sessionName.trim()) {
                                    $scope.isExistSessionName = true;
                                }
                                else {
                                    $scope.isExistSessionName = false;
                                }
                            }
                        }

                        $scope.ok = function (addSessionForm) {
                            if (addSessionForm.$valid && $scope.isMinDuration && !$scope.isExistSessionName) {
                                $scope.isSendingRequest = true;
                                $scope.newSession.courseId = courseId;

                                $http.post("CourseSessions/AddCourseSession", {
                                    sessionDto: $scope.newSession,
                                }).success(function (response) {
                                    if (response.success) {
                                        ModalService.showModal({}, {
                                            headerText: 'Add Session',
                                            bodyText: response.message
                                        });
                                        $modalInstance.dismiss();
                                        getCourseSessions();

                                    } else {
                                        ModalService.showModal({}, {
                                            headerText: 'Error',
                                            bodyText: response.message
                                        });
                                        $scope.isSendingRequest = false;
                                    }
                                })
                                .error(function (response) {
                                    ModalService.showModal({}, {
                                        headerText: 'Error',
                                        bodyText: response.message
                                    });
                                    $scope.isSendingRequest = false;
                                });
                            }
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };

                        $scope.sessionNameSetArgs = function (val, el, attrs, ngModel) {
                            return {
                                sessionName: val,
                                courseId: courseId
                            };
                        };

                    }
                ],
            });
        }

        $(window).on('popstate', function () {
            $(".modal").modal('hide');
        });
    }]);
