'use strict';
angular.module('mainApp').controller('ExternalUser',
    ['$scope', '$rootScope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', 'ModalService', 'Upload',
        'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS', 'AuthService', 'USER_ROLES', 'EXTERNALUSER_STATUS',
function ($scope, $rootScope, $http, cfpLoadingBar, $state, $stateParams, $modal, ModalService, Upload,
        DTOptionsBuilder, DTColumnDefBuilder, SETTINGS, AuthService, USER_ROLES, EXTERNALUSER_STATUS) {

    init();

    function init() {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
                  .withOption('bFilter', false)
                  .withOption('bInfo', false)
                  .withOption('bPaginate', false)
                  .withOption('bLengthChange', false)
                  .withOption('columnDefs', [{ "sortable": false, "targets": [0] }])

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).notSortable(),
            DTColumnDefBuilder.newColumnDef(6).notSortable(),
        ];

        $scope.dtInstanceCallback = function (dtInstance) {
            dtInstance.DataTable.on('order.dt', function () {
                dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                    cell.innerHTML = i + 1;
                });
            });
        }

        getAllExternalUsers();
    }

    function getAllExternalUsers() {
        getAllUsernames();
        getAllBadgeIDs();
        $http.get("ExternalUser/GetAllExternalUsers", {
        }).success(function (response) {
            if (response.success == true) {
                $scope.externalUsers = response.data;
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

    function getAllUsernames() {
        $http.get("ExternalUser/GetAllUsernames")
            .success(function (response) {
                if (response.success) {
                    $scope.usernames = response.data;
                }
                else {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                    });
                }
            }).error(function (response) {
                if (response.message) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                    });
                }
            });
    }

    function getAllBadgeIDs() {
        $http.get("ExternalUser/GetAllBadgeIDs")
            .success(function (response) {
                if (response.success) {
                    $scope.badgeIDs = response.data;
                }
                else {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                    });
                }
            }).error(function (response) {
                if (response.message) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                    });
                }
            });
    }

    $scope.openModalAddExternalTrainer = function () {
        var modalInstance = $modal.open({
            animation: true,
            backdrop: 'static',
            templateUrl: 'addExternalTrainerDialog.html',
            scope: $scope,
            controller: [
                '$scope', '$modalInstance', function ($scope, $modalInstance) {
                    $scope.isSendingRequest = false;
                    $scope.inputType = 'password';
                    $scope.showPass = true;
                    $scope.statusArray = EXTERNALUSER_STATUS;
                    $scope.imageUrl = "Uploads/CourseImages/DefaultTrainerAvatar.jpg";

                    $scope.checkExistUsername = function (username) {
                        if ($scope.usernames.indexOf(username.trim()) != -1) {
                            $scope.isExistUsername = true;
                        }
                        else {
                            $scope.isExistUsername = false;
                        }
                    }

                    $scope.checkExistBadgeID = function (badgeID) {
                        if ($scope.badgeIDs.indexOf(badgeID.trim()) != -1) {
                            $scope.isExistBadgeID = true;
                        }
                        else {
                            $scope.isExistBadgeID = false;
                        }
                    }
                    
                    $scope.hideShowPassword = function () {
                        if ($scope.inputType == 'password') {
                            $scope.inputType = 'text';
                            $scope.showPass = true;
                        }
                        else {
                            $scope.inputType = 'password';
                            $scope.showPass = false;
                        }
                    }

                    $scope.ok = function (addExternalTrainerForm) {
                        if (addExternalTrainerForm.$valid && !$scope.isExistUsername && !$scope.isExistBadgeID) {
                            $scope.isSendingRequest = true;
                            $http.post("ExternalUser/AddExternalUser", {
                                externalUserDto: $scope.newExternalTrainer,
                            }).success(function (response) {
                                $scope.message = response.message;
                                uploadImage(response.externalUserId, $scope.message);
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

                    function uploadImage(externalUserId, message) {
                        if ($scope.picFile) {
                            Upload.upload({
                                url: 'ExternalUser/UploadImage',
                                data: {
                                    externalUserId: externalUserId,
                                    externalImage: $scope.picFile
                                }
                            }).then(function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Add Image',
                                    bodyText: message
                                });
                                $modalInstance.dismiss();
                                getAllExternalUsers();
                            }, function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.data.message
                                });
                            });
                        } else {
                            ModalService.showModal({}, {
                                headerText: 'Add Image',
                                bodyText: message
                            });
                        }
                        $modalInstance.dismiss();
                    }

                    $scope.cancel = function () {
                        $modalInstance.dismiss();
                    };

                    $scope.onStatusChange = function () {
                        if ($scope.newExternalTrainer.Status != null) {
                            $scope.isStatusValid = false;
                        }
                        else {
                            $scope.isStatusValid = true;
                        }
                    }
                }
            ],
        });
    }

    function getExternalUser(externalUserId) {
        var result = {};
        angular.forEach($scope.externalUsers, function (externalUser, index) {
            if (externalUser.Id == externalUserId) {
                result = externalUser;
            }
        });
        return result;
    }

    $scope.openModalEditExternalTrainer = function (externalUserId) {
        var modalInstance = $modal.open({
            animation: true,
            backdrop: 'static',
            templateUrl: 'editExternalTrainerDialog.html',
            scope: $scope,
            controller: [
                '$scope', '$modalInstance', function ($scope, $modalInstance) {
                    $scope.inputType = 'password';
                    $scope.showPass = true;
                    $scope.checkExistUsername = function (username) {
                        if ($scope.usernames.indexOf(username.trim()) != -1 && username != $scope.externalTrainer.Username) {
                            $scope.isExistUsername = true;
                        }
                        else {
                            $scope.isExistUsername = false;
                        }
                    }

                    $scope.checkExistBadgeID = function (badgeID) {
                        if ($scope.badgeIDs.indexOf(badgeID.trim()) != -1) {
                            $scope.isExistBadgeID = true;
                        }
                        else {
                            $scope.isExistBadgeID = false;
                        }
                    }

                    $scope.hideShowPassword = function () {
                        if ($scope.inputType == 'password') {
                            $scope.inputType = 'text';
                            $scope.showPass = true;
                        }
                        else {
                            $scope.inputType = 'password';
                            $scope.showPass = false;
                        }
                    }

                    $scope.isSendingRequest = false;
                    $scope.isStatusValid = true;
                    $scope.statusArray = EXTERNALUSER_STATUS;
                    $scope.oldImage = "";

                    $scope.externalTrainer = getExternalUser(externalUserId);
                    $scope.externalTrainerUpdate = angular.copy($scope.externalTrainer);

                    if ($scope.externalTrainerUpdate.ExternalUser.Image != null) {
                        $scope.imageUrl = "Uploads/ExternalUserImages/" + $scope.externalTrainerUpdate.ExternalUser.Image;
                    } else {
                        $scope.imageUrl = "Uploads/CourseImages/DefaultTrainerAvatar.jpg";
                    }

                    if ($scope.externalTrainerUpdate.IsDeleted == true) {
                        $scope.externalTrainerUpdate.IsDeleted = 1;
                    } else {
                        $scope.externalTrainerUpdate.IsDeleted = 0;
                    }

                    $scope.cancel = function () {
                        $modalInstance.dismiss();
                    };

                    $scope.ok = function (editExternalTrainerForm) {
                        if (editExternalTrainerForm.$valid && !$scope.isExistUsername && !$scope.isExistBadgeID) {
                            if ($scope.picFile && $scope.externalTrainerUpdate.ExternalUser.Image != null) {
                                $scope.oldImage = $scope.externalTrainerUpdate.ExternalUser.Image;
                            }
                            $scope.isSendingRequest = true;
                            $http.post("ExternalUser/EditExternalUser", {
                                externalUserDto: $scope.externalTrainerUpdate,
                                oldImage: $scope.oldImage
                            }).success(function (response) {
                                $scope.message = response.message;
                                uploadImage($scope.externalTrainerUpdate.Id, $scope.message);
                                $scope.isSendingRequest = false;
                                getAllExternalUsers();
                            }).error(function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.message
                                });
                                $scope.isSendingRequest = false;
                            });
                        }
                    }

                    function uploadImage(externalUserId, message) {
                        if ($scope.picFile) {
                            Upload.upload({
                                url: 'ExternalUser/UploadImage',
                                data: {
                                    externalUserId: externalUserId,
                                    externalImage: $scope.picFile
                                }
                            }).then(function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Upload Image',
                                    bodyText: message
                                });
                                $modalInstance.dismiss();
                                getAllExternalUsers();
                            }, function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.data.message
                                });
                            });
                        } else {
                            ModalService.showModal({}, {
                                headerText: 'Upload Image',
                                bodyText: message
                            });
                        }
                        $modalInstance.dismiss();
                    }

                    $scope.onStatusChange = function () {
                        if ($scope.externalTrainerUpdate.Status != null) {
                            $scope.isStatusValid = false;
                        }
                        else {
                            $scope.isStatusValid = true;
                        }
                    }
                }
            ]
        })
    }
}])
