'use strict';
angular.module('mainApp').controller('RecentRegistration',
    ['$scope', '$http', 'cfpLoadingBar', '$filter', '$state', '$stateParams', '$modal', 'ModalService', 'Upload',
        'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'REGISTRATION_STATUS', 'SETTINGS', 'AuthService', 'USER_ROLES', '$timeout',
function ($scope, $http, cfpLoadingBar, $filter, $state, $stateParams, $modal, ModalService, Upload,
    moment, DTOptionsBuilder, DTColumnDefBuilder, REGISTRATION_STATUS, SETTINGS, AuthService, USER_ROLES, $timeout) {

    init();

    function init() {
        $scope.dateFormat = SETTINGS.DATEFORMAT;
        $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withOption('bFilter', false)
          .withOption('bInfo', false)
          .withOption('bPaginate', false)
          .withOption('bLengthChange', false)
          .withOption('columnDefs', [{ "sortable": false, "targets": [1] }])

        $scope.dtInstanceCallback = function (dtInstance) {
            dtInstance.DataTable.on('order.dt', function () {
                dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                    cell.innerHTML = i + 1;
                });
            });
        }

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).notSortable(),
               DTColumnDefBuilder.newColumnDef(3).notSortable(),
            DTColumnDefBuilder.newColumnDef(4).notSortable()
        ];

        $http.get("ClassRegistration/GetDropdownList")
                      .success(function (response) {
                          if (response.success) {
                              $scope.UNACCEPTED_STATUS = response.data.unAcceptedStatus;
                              $http.get("ClassRegistration/GetRegistrationsOfNotStartedClasses")
                  .success(function (response) {
                      if (response.success == true) {
                          $scope.classes = response.data;
                          angular.forEach($scope.classes, function (aClass, key) {
                              angular.forEach(aClass.registrationDtos, function (registration, index) {

                                  if (registration.IsAccepted) {
                                      registration.UnAcceptedStatusOfTTC = null;
                                  }
                                  else {
                                      //reject
                                      if (registration.UnAcceptedStatusOfTTC == null) {
                                          registration.UnAcceptedStatusOfTTC = 1;
                                      }
                                  }
                              });

                              disableCheckbox(aClass.registrationDtos);
                              aClass.editingClass = angular.copy(aClass);
                              aClass.backup = angular.copy(aClass.editingClass);
                          });
                          $scope.isSendingRequest = false;

                      } else {
                          $scope.isSendingRequest = false;
                          ModalService.showModal({}, {
                              headerText: 'Error',
                              bodyText: response.message
                          });
                      }
                  }).error(function (response) {
                      $scope.isSendingRequest = false;
                      if (response.message) {
                          ModalService.showModal({}, {
                              headerText: 'Error',
                              bodyText: response.message
                          });
                      }
                  });
                          }
                      }).error(function (response) {
                          ModalService.showModal({}, {
                              headerText: 'Error',
                              bodyText: response.message
                          });
                      });

       

    }

    $scope.optionToggled = function (aClass, registration) {
        if (registration && !registration.IsAccepted) {
            registration.UnAcceptedStatusOfTTC = 1;
        }

        aClass.isAcceptedAll = aClass.registrationDtos.every(function (a) { return a.IsAccepted; })
    }

    $scope.selectAll = function (aClass) {
        var toggleStatus = aClass.isAcceptedAll;
        angular.forEach(aClass.registrationDtos, function (r) {
            r.IsAccepted = toggleStatus;
        });

    }

    $scope.reset = function (aClass) {
        $scope.isSendingRequest = true;
        $timeout(function () {
            aClass.editingClass = angular.copy(aClass.backup);
            $scope.isSendingRequest = false;
        }, 500);
    }

    $scope.save = function (aClass, registrations) {
        $scope.isSendingRequest = true;
        var acceptRegistrations = [];
        angular.forEach(registrations, function (registration, index) {
            if (registration.UnAcceptedStatusOfTTC != 5) {
                registration.OtherUnAcceptedReasonOfTTC = null;
            }
            acceptRegistrations.push({
                Id: registration.Id,
                IsAccepted: registration.IsAccepted,
                Status: registration.Status,
                UnAcceptedStatusOfTTC: registration.UnAcceptedStatusOfTTC || null,
                OtherUnAcceptedReasonOfTTC: registration.OtherUnAcceptedReasonOfTTC || null
            });
        });

        if (acceptRegistrations.length > 0 ) {
            $http.post("ClassRegistration/AcceptClassRegistrations", {
                acceptRegistrations: acceptRegistrations
            }).success(function (response) {
                aClass.backup = angular.copy(aClass.editingClass);
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

    function disableCheckbox(registrations) {
        var dateNow = new Date();

        for (var i = 0; i < registrations.length; i++) {
            var classStartTime = registrations[i].classStartTime.replace(/\/Date\((-?\d+)\)\//, '$1');
            var dateClassStartTime = new Date(parseInt(classStartTime));

            if (dateNow >= dateClassStartTime && registrations[i].IsAccepted == true) {
                registrations.IsDisableCheckBox = true;
            } else {
                registrations.IsDisableCheckBox = false;
            }
        }
    }
    
    $scope.sendMail = function (originalClass, $index) {
        var modalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'OK',
            headerText: 'Send Email Notification',
            bodyText: 'Are you sure you want to send email notification for all registrations in this class?'
        };
        ModalService.showModal({}, modalOptions).then(function (result) {
            var aClass = originalClass.backup;
            $scope.isSendingRequest = true;
            if (aClass.registrationDtos.length > 0) {
                $http.post("ClassRegistration/SendMailNotifyRegistrationsFromTTC", {
                    registrationDtos: aClass.registrationDtos
                }).success(function (response) {
                    originalClass.IsEmailNotifyRegistrationSent = true;
                    $scope.classes[$index].open = false;
                    if ($index != $scope.classes.length - 1) {
                        $scope.classes[$index + 1].open = true;
                    }

                    $scope.isSendingRequest = false;

                    ModalService.showModal({}, {
                        headerText: 'Send Mail Registration',
                        bodyText: response.message
                    });

                }).error(function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                    $scope.isSendingRequest = false;
                });
            }
        });
    }


}]);
