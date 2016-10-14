'use strict';
angular.module('mainApp').controller('MemberRegistration',
    ['$scope', '$http', 'cfpLoadingBar', '$filter', '$state', '$stateParams', '$modal',
     'ModalService', 'Upload', 'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS', 'DEFAULT_DIACRITICS',
function ($scope, $http, cfpLoadingBar, $filter, $state, $stateParams, $modal,
          ModalService, Upload, moment, DTOptionsBuilder, DTColumnDefBuilder, SETTINGS, DEFAULT_DIACRITICS) {

    init();

    function init() {
        $scope.$parent.menuRoute = $state.current.name;
        $scope.dateFormat = SETTINGS.DATEFORMAT;
        getRegistrations()
    }

    $scope.registrations = [];
    $scope.dtOptions = DTOptionsBuilder.newOptions()
      .withOption('bFilter', false)
      .withOption('bInfo', false)
      .withOption('bPaginate', false)
      .withOption('bLengthChange', false)

    $scope.dtInstanceCallback = function (dtInstance) {
        dtInstance.DataTable.on('order.dt', function () {
            dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        });
    }

    $scope.dtColumnDefs = [
           DTColumnDefBuilder.newColumnDef(0).notSortable(),
    ];

    $scope.checkedAll = function () {
        var toggleStatus = $scope.isCheckedAll;
        angular.forEach($scope.pendingRegistrations, function (a) { a.selected = toggleStatus; });

    }

    $scope.optionToggled = function () {
        $scope.isCheckedAll = $scope.pendingRegistrations.every(function (a) { return a.selected; })
    }

    $scope.getFullNameNoEquals = [];
    $scope.getUsernameNoEquals = [];
    $scope.getUsernameAndFullNameNoEquals = [];
    $scope.getProjectNoEquals = [];
    //$scope.getCourseNameNoEquals = []; //search follow course
    $scope.getClassNameNoEquals = [];

    $scope.getFullNameHistoryNoEquals = [];
    $scope.getUsernameHistoryNoEquals = [];
    $scope.getUsernameAndFullNameHistoryNoEquals = [];
    $scope.getProjectHistoryNoEquals = [];
    //$scope.getCourseNameHistoryNoEquals = []; //search follow course
    $scope.getClassNameHistoryNoEquals = [];

    function getRegistrations() {
        $http.get("MemberRegistrations/GetRegistrationsByManager", {
        }).success(function (response) {
            //pendingRegistrations------------------------------------------
            angular.forEach(response.data.pendingRegistrations, function (pendingRegistration, index) {
                pendingRegistration.FullNameNoneDiacritics = removeDiacritics(pendingRegistration.FullName);
                if ($scope.getFullNameNoEquals.indexOf(pendingRegistration.FullName) === -1) {
                    $scope.getFullNameNoEquals.push(pendingRegistration.FullName);
                }
                if ($scope.getUsernameNoEquals.indexOf(pendingRegistration.Username) === -1) {
                    $scope.getUsernameNoEquals.push(pendingRegistration.Username);
                }
                if ($scope.getProjectNoEquals.indexOf(pendingRegistration.ProjectName) === -1) {
                    $scope.getProjectNoEquals.push(pendingRegistration.ProjectName);

                }
                //search follow course
                //if ($scope.getCourseNameNoEquals.indexOf(pendingRegistration.CourseName) === -1) {
                //    $scope.getCourseNameNoEquals.push(pendingRegistration.CourseName);
                //}
                if ($scope.getClassNameNoEquals.indexOf(pendingRegistration.ClassName) === -1) {
                    $scope.getClassNameNoEquals.push(pendingRegistration.ClassName);
                }
                if (pendingRegistration.Status == 1) {
                    pendingRegistration.StatusDetail = "Pending Approval";
                } else if (pendingRegistration.Status == 2) {
                    pendingRegistration.StatusDetail = "Approved ";
                } else if (pendingRegistration.Status == 3) {
                    pendingRegistration.StatusDetail = "Requesting Withdrawal";
                } else if (pendingRegistration.Status == 4) {
                    pendingRegistration.StatusDetail = "Withdrawal Approved";
                } else if (pendingRegistration.Status == 5) {
                    pendingRegistration.StatusDetail = "Rejected";
                }
            });
            for (var i = 0; i < $scope.getFullNameNoEquals.length; i++) {
                $scope.getUsernameAndFullNameNoEquals.push({
                    FullName: $scope.getFullNameNoEquals[i],
                    Username: $scope.getUsernameNoEquals[i]
                })
            }
            $scope.pendingRegistrations = response.data.pendingRegistrations;
            $scope.pendingRegistrationsStatusDetails = [
                "Pending Approval",
                "Requesting Withdrawal"
            ]

            //historyRegistrations------------------------------------------
            angular.forEach(response.data.historyRegistrations, function (historyRegistration, index) {
                historyRegistration.FullNameNoneDiacritics = removeDiacritics(historyRegistration.FullName);
                if ($scope.getFullNameHistoryNoEquals.indexOf(historyRegistration.FullName) === -1) {
                    $scope.getFullNameHistoryNoEquals.push(historyRegistration.FullName);
                }
                if ($scope.getUsernameHistoryNoEquals.indexOf(historyRegistration.Username) === -1) {
                    $scope.getUsernameHistoryNoEquals.push(historyRegistration.Username);
                }
                if ($scope.getProjectHistoryNoEquals.indexOf(historyRegistration.ProjectName) === -1) {
                    $scope.getProjectHistoryNoEquals.push(historyRegistration.ProjectName);

                }
                //search follow course
                //if ($scope.getCourseNameHistoryNoEquals.indexOf(historyRegistration.CourseName) === -1) {
                //    $scope.getCourseNameHistoryNoEquals.push(historyRegistration.CourseName);
                //}
                if ($scope.getClassNameHistoryNoEquals.indexOf(historyRegistration.ClassName) === -1) {
                    $scope.getClassNameHistoryNoEquals.push(historyRegistration.ClassName);
                }
                if (historyRegistration.Status == 1) {
                    historyRegistration.StatusDetail = "Pending Approval";
                } else if (historyRegistration.Status == 2) {
                    historyRegistration.StatusDetail = "Approved ";
                } else if (historyRegistration.Status == 3) {
                    historyRegistration.StatusDetail = "Requesting Withdrawal";
                } else if (historyRegistration.Status == 4) {
                    historyRegistration.StatusDetail = "Withdrawal Approved";
                } else if (historyRegistration.Status == 5) {
                    historyRegistration.StatusDetail = "Rejected";
                }
            });
            for (var i = 0; i < $scope.getFullNameHistoryNoEquals.length; i++) {
                $scope.getUsernameAndFullNameHistoryNoEquals.push({
                    FullName: $scope.getFullNameHistoryNoEquals[i],
                    Username: $scope.getUsernameHistoryNoEquals[i]
                })
            }
            $scope.historyRegistrations = response.data.historyRegistrations;
            $scope.historyRegistrationsStatusDetails = [
                "Approved ",
                "Withdrawal Approved",
                "Rejected"
            ]
            

        }).error(function (response) {
            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: response.message
            });
        });
    }

    $scope.approve = function () {
        $scope.registrationIds = [];
        angular.forEach($scope.pendingRegistrations, function (pendingRegistration, index) {
            if (pendingRegistration.selected) {
                $scope.registrationIds.push(pendingRegistration.Id);
            }
        });

        if ($scope.registrationIds != null) {
            $http.post("MemberRegistrations/ApproveRegistrations", {
                registrationIds: $scope.registrationIds,
            }).success(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Approved',
                    bodyText: response.message
                });
                getRegistrations()
            }).error(function (response) {
                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
        }
    }

    $scope.reject = function () {
        $scope.registrationIds = [];
        angular.forEach($scope.pendingRegistrations, function (pendingRegistration, index) {
            if (pendingRegistration.selected) {
                $scope.registrationIds.push(pendingRegistration.Id);
            }
        });
        if ($scope.registrationIds.length != 0) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'Reject.html',
                scope: $scope,
                controller: [
                    '$modalInstance', function ($modalInstance) {
                        var registrationIds = $scope.registrationIds;

                        $scope.ok = function (rejectForm, rejectReason) {
                            if ($scope.registrationIds != null && rejectForm.$valid) {
                                $http.post("MemberRegistrations/RejectRegistrations", {
                                    registrationIds: registrationIds,
                                    rejectReason: rejectReason,
                                }).success(function (response) {
                                    ModalService.showModal({}, {
                                        headerText: 'Rejected',
                                        bodyText: response.message
                                    }).then(function (result) {
                                        $modalInstance.dismiss();
                                    });;
                                    getRegistrations()
                                }).error(function (response) {
                                    ModalService.showModal({}, {
                                        headerText: 'Error',
                                        bodyText: response.message
                                    });
                                });
                            }
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    }]
            })
        }
        else {
            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: "No registration to reject"
            });
        }
    }

    var defaultDiacriticsRemovalMap = DEFAULT_DIACRITICS;

    function removeDiacritics(source) {
        for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
            source = source.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
        }
        return source;
    }

    $scope.cleanPending = function () {
        $scope.searchPendingRegistration = [];
        $state.reload();
    }

    $scope.cleanHistory = function () {
        $scope.searchFunction = [];
        $state.reload();
    }
}]);