'use strict';
angular.module('mainApp').controller('MyClasses',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', '$filter', 'ModalService', 'SETTINGS',
        function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal, $filter, ModalService, SETTINGS) {

            var vm = this;

            init();

            $scope.classStatus = {
                'OnGoing': 1,
                'Done': 2,
                'RequestingWithdrawal':3,
                'WithdrawalApproved': 4,
                'Cancelled': 5,
                'PendingApproval': 6,
                'PendingAcceptance': 7,
                'Rejected': 8
            }

            function init() {
                $scope.dateFormat = SETTINGS.DATEFORMAT;
                $("#search").focus();
                $scope.$parent.menuRoute = $state.current.name;
                $scope.currentDate = Date.now();
                getMyClasses();
            }

            function getMyClasses() {
                $http.get("Class/GetMyClasses")
                    .success(function (response) {
                        if (response.success) {
                            $scope.myClasses = response.data;

                            var curentDate = new Date();
                            angular.forEach($scope.myClasses, function (option, index) {
                                var classStartTime = new Date(parseInt(option.StartTime.replace(/\/Date\((-?\d+)\)\//, '$1')));
                                if (curentDate >= classStartTime) {
                                    option.IsStart = true;
                                } else {
                                    option.IsStart = false;
                                }

                                angular.forEach(option.ClassTrainers, function (classTrainer, key) {
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

            $scope.getColorByClassStatus = function (status) {
                if (status == $scope.classStatus.OnGoing) {
                    return "item-background-on-going-color";
                }
                else if (status == $scope.classStatus.Done) {
                    return "item-background-done-color";
                }
                else if (status == $scope.classStatus.RequestingWithdrawal) {
                    return "item-background-on-going-color";
                }
                else if (status == $scope.classStatus.WithdrawalApproved) {
                    return "item-background-withdrew-color";
                }
                else if (status == $scope.classStatus.Cancelled) {
                    return "item-background-cancel-color";
                }
                else if (status == $scope.classStatus.PendingApproval) {
                    return "item-background-pending-color";
                }
                else if (status == $scope.classStatus.PendingAcceptance) {
                    return "item-background-pending-color";
                }
                else if (status == $scope.classStatus.Rejected) {
                    return "item-background-reject-color";
                }
            }

            $scope.getColor = function (status) {
                if (status == $scope.classStatus.OnGoing) {
                    return "item-border-on-going-color";
                }
                else if (status == $scope.classStatus.Done) {
                    return "item-border-done-color";
                }
                else if (status == $scope.classStatus.RequestingWithdrawal) {
                    return "item-border-on-going-color";
                }
                else if (status == $scope.classStatus.WithdrawalApproved) {
                    return "item-border-withdrew-color";
                }
                else if (status == $scope.classStatus.Cancelled) {
                    return "item-border-cancelled-color";
                }
                else if (status == $scope.classStatus.PendingApproval) {
                    return "item-border-pending-color";
                }
                else if (status == $scope.classStatus.PendingAcceptance) {
                    return "item-border-pending-color";
                }
                else if (status == $scope.classStatus.Rejected) {
                    return "item-border-rejected-color";
                }
            }

            $scope.show = false;
            $scope.predicate = 'StartTime';
            $scope.reverse = true;
            $scope.sort = function (predicate) {
                $scope.show = !$scope.show;
                $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
                $scope.predicate = predicate;
            }

            $scope.cancelRegistration = function (registrationId) {
                var modalOptions = {
                    closeButtonText: 'Cancel',
                    actionButtonText: 'OK',
                    headerText: 'Withdraw Registration',
                    bodyText: 'Are you sure you want to withdraw from this class?'
                };
                ModalService.showModal({}, modalOptions).then(function (result) {
                    $http.post("ClassRegistration/CancelRegistration", {
                        registrationId: registrationId
                    }).success(function (response) {
                        if (response.success) {
                            ModalService.showModal({}, {
                                headerText: 'Withdraw Registration',
                                bodyText: response.message
                            });
                            getMyClasses();
                        } else {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                                bodyText: response.message
                            });
                        }
                    }).error(function (response) {
                        ModalService.showModal({}, {
                            headerText: 'Error Unauthorized',
                            bodyText: response.message
                        });
                    });
                });
            }

            $scope.openModalViewActivities = function (classId, classStatus) {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    templateUrl: 'viewActivitiesDialog.html',
                    size: 'lg',
                    controller: [
                        '$scope', '$modalInstance', 'SETTINGS', 'DTOptionsBuilder', 'DTColumnDefBuilder',
                        function ($scope, $modalInstance, SETTINGS, DTOptionsBuilder, DTColumnDefBuilder) {
                            initViewActivities();

                            function initViewActivities() {
                                $scope.dateFormat = SETTINGS.DATEFORMAT;
                                $scope.notes = [];

                                $scope.dtOptions = DTOptionsBuilder.newOptions()
                                    .withOption('bFilter', false)
                                    .withOption('bInfo', false)
                                    .withOption('bPaginate', false)
                                    .withOption('bLengthChange', false)
                                    .withOption('columnDefs', [{ "sortable": false, "targets": [0] }])

                                $scope.dtInstanceCallback = function (dtInstance) {
                                    dtInstance.DataTable.on('order.dt', function () {
                                        dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                                            cell.innerHTML = i + 1;
                                        });
                                    });
                                }

                                $scope.dtColumnDefs = [
                                    DTColumnDefBuilder.newColumnDef(0).notSortable()
                                ];

                                getClassActivitiesOfParticipant(classId, classStatus);
                            }

                            $scope.close = function () {
                                $modalInstance.dismiss();
                            };

                            function getClassActivitiesOfParticipant(classId, classStatus) {
                                $http.get("Class/GetClassActivitiesOfParticipant", {
                                    params: {
                                        classId: classId,
                                        classStatus: classStatus
                                    }
                                }).success(function (response) {
                                    $scope.notes = response.data;
                                }).error(function (response) {
                                    ModalService.showModal({}, {
                                        headerText: 'Error',
                                        bodyText: response.message
                                    });
                                });
                            }

                        }
                    ]
                });
            }
        }]);
