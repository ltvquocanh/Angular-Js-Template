'use strict';
angular.module('mainApp').controller('ClassRegistration',
    ['$scope', '$http', 'cfpLoadingBar', '$filter', '$state', '$stateParams', '$modal', 'ModalService', 'Upload',
        'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'REGISTRATION_STATUS', 'SETTINGS', 'AuthService', 'USER_ROLES',
function ($scope, $http, cfpLoadingBar, $filter, $state, $stateParams, $modal, ModalService, Upload,
    moment, DTOptionsBuilder, DTColumnDefBuilder, REGISTRATION_STATUS, SETTINGS, AuthService, USER_ROLES) {
    var classId = $stateParams.id;

    init();

    function init() {
        $scope.dateFormat = SETTINGS.DATEFORMAT;
        $scope.$parent.route = $state.current.name;
        $scope.registrations = [];
        $scope.registrationsBackups = [];
        $scope.isStatusValid = false;
        $scope.isDisableCheckboxs = [];

        $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withOption('bFilter', false)
          .withOption('bInfo', false)
          .withOption('bPaginate', false)
          .withOption('bLengthChange', false)
          .withOption('columnDefs', [{ "sortable": false, "targets": [1] }])

        $scope.dtInstanceCallback = function (dtInstance) {
            dtInstance.DataTable.on('order.dt', function () {
                dtInstance.DataTable.column(1).nodes().each(function (cell, i) {
                    cell.innerHTML = i + 1;
                });
            });
        }

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).notSortable(),
            DTColumnDefBuilder.newColumnDef(1).notSortable()
        ];

        CheckClassIsCancel();
        getAllRegistrationStatus();
    }

    function getAllRegistrationStatus() {
        $http.get("ClassRegistration/GetAllRegistrationStatus")
            .success(function (response) {
                if (response.success) {
                    $scope.allStatus = response.data;
                    getRegistrations();
                }
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
    }

    $scope.openModalAddRegistration = function (courseId) {
        var modalInstance = $modal.open({
            animation: true,
            backdrop: 'static',
            templateUrl: 'addRegistrationDialog.html',
            scope: $scope,
            controller: [
                '$scope', '$modalInstance', function ($scope, $modalInstance) {
                    initAddRegistration();

                    function initAddRegistration() {

                        $scope.statusArray = REGISTRATION_STATUS;

                        $scope.newRegistration = {};

                        getUsersNotRegisteredClass(classId);
                    }

                    $scope.onSelectUser = function (selectedUser, status) {
                        if (!selectedUser.IsExternal) {
                            $http.get("ClassRegistration/GetUserInfoFromHRM", {
                                params: {
                                    username: selectedUser.Username
                                }
                            }).success(function (response) {
                                $scope.newRegistration = response.data;
                                $scope.newRegistration.UserId = selectedUser.Id;
                                $scope.newRegistration.Username = selectedUser.Username;
                                $scope.newRegistration.FullName = selectedUser.FullName;
                                $scope.userRegistration = $scope.newRegistration.FullName + " (" + $scope.newRegistration.Username + "@tma.com.vn)";

                                if ($scope.newRegistration.ManagerUsername != null) {
                                    $scope.manager = $scope.newRegistration.ManagerFullName
                                                    + " (" + $scope.newRegistration.ManagerUsername + "@tma.com.vn)";
                                } else {
                                    $scope.manager = null;
                                }
                                $scope.newRegistration.Status = status;
                            }).error(function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.message
                                });
                                $scope.newRegistration = null;
                                $scope.manager = null
                            });
                        } else {
                            $scope.newRegistration.UserId = selectedUser.Id;
                            $scope.newRegistration.Username = selectedUser.Username;
                            $scope.newRegistration.FullName = selectedUser.FullName;
                            $scope.userRegistration = $scope.newRegistration.FullName + " (" + $scope.newRegistration.Username + "@tma.com.vn)";
                        }
                    };

                    $scope.ok = function (addRegistrationForm) {
                        if (addRegistrationForm.$valid && $scope.isStatusValid) {
                            $scope.isSendingRequest = true;
                            $scope.newRegistration.ClassId = classId;
                            $http.post("ClassRegistration/AddRegistration", {
                                registrationDto: $scope.newRegistration,
                            }).success(function (response) {
                                getRegistrations();
                                $scope.isSendingRequest = false;
                                ModalService.showModal({}, {
                                    headerText: 'Add Registration',
                                    bodyText: response.message
                                });
                                $modalInstance.dismiss();
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

                    function getUsersNotRegisteredClass(classId) {
                        $http.get("ClassRegistration/GetUsersNotRegisteredClass", {
                            params: {
                                classId: classId
                            }
                        }).success(function (response) {
                            $scope.allUsers = response.data;
                        }).error(function (response) {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                                bodyText: response.message
                            });
                        });
                    }

                    $scope.getMatchingUsers = function ($viewValue) {
                        var matchingUsers = [];

                        for (var i = 0; i < $scope.allUsers.length; i++) {
                            if ($scope.allUsers[i].Username.toLowerCase().indexOf($viewValue.toLowerCase()) != -1 ||
                                $scope.allUsers[i].FullName.toLowerCase().indexOf($viewValue.toLowerCase()) != -1) {

                                matchingUsers.push($scope.allUsers[i]);
                            }
                        }
                        return matchingUsers;
                    }

                    $scope.onStatusChange = function () {
                        if ($scope.newRegistration.Status != null
                               && $scope.newRegistration.Status != 0) {
                            $scope.isStatusValid = true;
                        }
                        else {
                            $scope.isStatusValid = false;
                        }
                    }
                }
            ]
        });
    }

    $scope.selectAll = function () {
        var toggleStatus = $scope.isAcceptedAll;
        var dateNow = new Date();

        for (var i = 0; i < $scope.registrations.length; i++) {
            var classStartTime = $scope.registrations[i].classStartTime.replace(/\/Date\((-?\d+)\)\//, '$1');
            var dateClassStartTime = new Date(parseInt(classStartTime));

            if (dateNow >= dateClassStartTime) {
                if ($scope.registrationsBackups[i].IsAccepted != true) {
                    $scope.registrations[i].IsAccepted = toggleStatus;
                }
            }
            else {
                $scope.registrations[i].IsAccepted = toggleStatus;
            }
        }
    }

    $scope.optionToggled = function () {
        $scope.isAcceptedAll = $scope.registrations.every(function (a) { return a.IsAccepted; })
    }

    $scope.save = function () {
        $scope.isSendingRequest = true;
        $scope.acceptRegistrations = [];
        angular.forEach($scope.registrations, function (registration, index) {
            $scope.acceptRegistrations.push({
                Id: registration.Id,
                IsAccepted: registration.IsAccepted,
                Status: registration.Status
            });
        });

        if ($scope.acceptRegistrations != null) {
            $http.post("ClassRegistration/AcceptClassRegistrations", {
                acceptRegistrations: $scope.acceptRegistrations
            }).success(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Update Registration',
                    bodyText: response.message
                });
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

    $scope.reset = function () {
        getRegistrations();
    }

    function getRegistrations() {
        if (classId != "") {
            $scope.isSendingRequest = true;
            $http.get("ClassRegistration/GetRegistrations", {
                params: {
                    classId: classId
                }
            }).success(function (response) {
                $scope.registrations = response.data;
                $scope.registrationsBackups = angular.copy($scope.registrations);
                checkAllFirstTime();
                disableCheckbox();
                $scope.isSendingRequest = false;
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            })
        }
    }

    function CheckClassIsCancel() {
        if (classId != "") {
            $http.get("ClassActivity/CheckClassIsCancel", {
                params: {
                    classId: $scope.classId,
                },
            }).success(function (response) {
                if (response.success) {
                    $scope.isCancel = response.data;
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

    $scope.hasResetAndSavePermission = function () {
        return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                        USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
    }

    $scope.hasImportAndExportAndAddRegistrationPermission = function () {
        return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                        USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
    }

    function disableCheckbox() {
        var dateNow = new Date();
        $scope.isDisableCheckboxs = [];
        for (var i = 0; i < $scope.registrations.length; i++) {
            var classStartTime = $scope.registrations[i].classStartTime.replace(/\/Date\((-?\d+)\)\//, '$1');
            var dateClassStartTime = new Date(parseInt(classStartTime));

            if (dateNow >= dateClassStartTime && $scope.registrations[i].IsAccepted == true) {
                $scope.isDisableCheckboxs.push(true);
            } else {
                $scope.isDisableCheckboxs.push(false);
            }
        }
    }

    function checkAllFirstTime() {
        var count = 0;

        for (var i = 0; i < $scope.registrations.length; i++) {
            if ($scope.registrations[i].IsAccepted == true) {
                count++
            }
        }

        if (count == $scope.registrations.length) {
            $scope.isAcceptedAll = true;
        } else {
            $scope.isAcceptedAll = false;
        }
    }

    $scope.exportRegistrations = function () {
        var urlAction = "ClassRegistration/ExportRegistrations?classId=" + $scope.classId;
        window.location.assign(urlAction);
    }

    $scope.openModalImportRegistrations = function (classId) {
        var modalInstance = $modal.open({
            animation: true,
            backdrop: 'static',
            templateUrl: 'importRegistrationsDialog.html',
            scope: $scope,
            controller: [
                '$scope', '$modalInstance', function ($scope, $modalInstance) {
                    $scope.import = function (importRegistrationsForm) {
                        if (importRegistrationsForm.$valid) {
                            $scope.isSendingRequest = true;
                            if ($scope.importFile == null) {
                                ModalService.showModal({}, {
                                    headerText: 'Import Registrator Data',
                                    bodyText: 'Please browse an import file to proceed'
                                });
                                $scope.isSendingRequest = false;
                                return;
                            }
                            Upload.upload({
                                url: 'ClassRegistration/ImportRegistrations',
                                data: {
                                    classId: classId,
                                    file: $scope.importFile
                                }
                            }).then(function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Import Registrator Data',
                                    bodyText: response.data.message
                                });
                                $scope.isSendingRequest = false;
                                $modalInstance.dismiss();
                                getRegistrations();
                            }, function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.data.message
                                });
                                $scope.isSendingRequest = false;
                            });
                        }
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss();
                    };
                }
            ]
        });
    }

    $scope.hasChangeStatusPermission = function () {
        return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                        USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
    }
}]);
