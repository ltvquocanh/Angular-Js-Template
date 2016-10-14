'use strict';
angular.module('mainApp').controller('CourseClass',
    ['$scope','$rootScope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal',
        'ModalService', 'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'AuthService', 'USER_ROLES',
        function ($scope, $rootScope, $http, cfpLoadingBar, $state, $stateParams, $modal,
            ModalService, moment, DTOptionsBuilder, DTColumnDefBuilder, AuthService, USER_ROLES) {

            var vm = this;

            init();

            function init() {
                $scope.courseId = $stateParams.id;
                $scope.$parent.route = $state.current.name;
                $rootScope.currentDateTime = Date.now();
                $scope.classes = [];
                $scope.maxDate = 253402275599997;

                GetClassesOfCourse();
            }

            function GetClassesOfCourse() {
                if ($scope.courseId != "") {
                    $http.get("CourseClasses/GetClasses", {
                        params: {
                            courseId: $scope.courseId,
                        },
                    })
                    .success(function (response) {
                        if (response.success == true) {
                            $scope.classes = response.data;

                            for (var i = 0; i < $scope.classes.length; i++) {
                                if ($scope.classes[i].StartTime != null && $scope.classes[i].EndTime != null) {
                                    var startTime = $scope.classes[i].StartTime;
                                    $scope.classes[i].StartTime = parseInt(startTime.substr(6));
                                    var endTime = $scope.classes[i].EndTime;
                                    $scope.classes[i].EndTime = parseInt(endTime.substr(6));
                                }
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
            }

            $scope.dtOptions = DTOptionsBuilder.newOptions()
               .withOption('bStateSave', true)
               .withOption("stateSaveParams", function (settings, data) {
                   delete data.search;
                   delete data.order;
               })
               .withOption('bFilter', false)
               .withOption('bInfo', false)
               .withOption('bPaginate', false)
               .withOption('bLengthChange', false)
               .withOption('columnDefs', [{ "sortable": false, "targets": [0] }])

            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(7).notSortable()
                // column seventh is "Action", it is no need to sort
            ];

            $scope.dtInstanceCallback = function (dtInstance) {
                dtInstance.DataTable.on('order.dt', function () {
                    dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
                });
            }

            $scope.deleteClass = function (id) {
                var modalOptions = {
                    closeButtonText: 'Cancel',
                    actionButtonText: 'OK',
                    headerText: 'Delete Class',
                    bodyText: 'Are you sure you want to delete this class?'
                };

                ModalService.showModal({}, modalOptions).then(function (result) {
                    $http.post("CourseClasses/DeleteClass", {
                        classID: id
                    })
                        .success(function (response) {
                            if (response.success == true) {

                                ModalService.showModal({}, {
                                    headerText: 'Delete Class',
                                    bodyText: 'Class is deleted successfully.'
                                });

                                angular.forEach($scope.classes, function (value, key) {
                                    if (value.Id == id) {
                                        $scope.classes.splice(key, 1);
                                    }
                                });

                            } else {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: 'Deleting has failed.'
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

            $scope.hasAddClassPermission = function () {
                return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                                USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
            }

            $scope.isCancel = function (status, endTime, startTime) {
                if (status != undefined) {
                    if (status == 'Cancelled') {
                        return true;
                    } else if (endTime < $rootScope.currentDateTime && endTime != null) {
                        return true;
                    } else if (startTime <= $rootScope.currentDateTime && endTime >= $rootScope.currentDateTime && endTime != null) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }

            function getClass(classId) {
                var result = {};
                angular.forEach($scope.classes, function (aClass, index) {
                    if (aClass.Id == classId) {
                        result = aClass;
                    }
                });
                return result;
            }

            $scope.cancelClass = function (id) {

                var modalInstance = $modal.open({
                    size: 'lg',
                    animation: true,
                    backdrop: 'static',
                    templateUrl: 'SendMailCancelClass.html',
                    scope: $scope,
                    controller: [
                        '$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.isSendMeetingRequest = false;
                            $scope.isSendingRequest = false;
                            $scope.participants = [];
                            $scope.session = [];
                            $scope.toMail = [];
                            $scope.ccMail = [];
                            $scope.mail = {
                                to: "",
                                cc: "",
                                content: "",
                                reason: ""
                            }

                            $http.post("CourseClasses/GetParticipant", {
                                classId: id,

                            }).success(function (response) {
                                if (response.success) {
                                    $scope.to = response.data.to;
                                    $scope.cc = response.data.cc;
                                    for (var i = 0; i < $scope.to.length; i++) {
                                        if (i == $scope.to.length - 1) {
                                            $scope.mail.to += $scope.to[i] + "@tma.com.vn";
                                        } else {
                                            $scope.mail.to += $scope.to[i] + "@tma.com.vn" + "; ";
                                        }
                                    }
                                    for (var i = 0; i < $scope.cc.length; i++) {
                                        if (i == $scope.cc.length - 1) {
                                            $scope.mail.cc += $scope.cc[i] + "@tma.com.vn";
                                        } else {
                                            $scope.mail.cc += $scope.cc[i] + "@tma.com.vn" + "; ";
                                        }
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



                            var classes = getClass(id);

                            $scope.mail.content =
                                "<p>Dear All, </p>"
                                + "<p>The class "
                                + "<a href='http:/" + window.location.host + "/#/viewcourse/" + classes.CourseId + "' size='3' color='#F0B51B'>" + classes.CourseName + "</a>"
                                + " scheduled on "
                                + "<font size='3' color='red'>" + moment(classes.StartTime).format("MMM DD, YYYY") + "</font>"
                                + " was canceled </p><br /><br /><br />"
                                + "--------------------------------------------------------------------<br />"
                                + "<font size='2' face='Arial'>"
                                + "This message is automatically generated by the Training Tool <br />"
                                + "Please contact PMO Tools team at <font size='2' color='blue' >pmo_tools@tma.com.vn</font> if there is any issue about this tool"
                                + "<br /><br />"
                                + "<font size='2' color='#1D5d97' face='Palatino Linotype'>This e-mail and any attachments are TMA Solutions property, are confidential, and are intended solely for the use of the individual or entity to whom this e-mail is addressed. If you are not one of the named recipient(s) or otherwise have reason to believe that you have received this message in error, please notify the sender, delete and ignore the contents</span>"
                                + "</font>"

                            $scope.isMailFormatValid = true;

                            $scope.checkMailFormat = function (mailList) {
                                if (mailList != "") {
                                    var mailList = mailList.split(';');
                                    for (var b = 0; b < mailList.length; b++) {
                                        var formatMail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                        $scope.isMailFormatValid = formatMail.test(mailList[b].trim());
                                        if (!$scope.isMailFormatValid)
                                            return $scope.isMailFormatValid;
                                    }
                                    return $scope.isMailFormatValid;
                                }
                            }

                            function getToMail() {
                                var to = $scope.mail.to.split(';');
                                $scope.toMail = to;
                                to = [];
                                for (var b = 0; b < $scope.toMail.length; b++) {
                                    var userName = $scope.toMail[b].trim().split('@', 1);
                                    if (userName != "" && userName.length == 1) {
                                        to.push(userName[0]);
                                    }

                                }
                                return to;
                            }

                            function getCcMail() {
                                var cc = $scope.mail.cc.split('; ');
                                $scope.ccMail = cc;
                                cc = [];
                                for (var b = 0; b < $scope.ccMail.length; b++) {
                                    var userName = $scope.ccMail[b].trim().split('@', 1);
                                    if (userName != "" && userName.length == 1) {
                                        cc.push(userName[0]);
                                    }
                                }
                                return cc;
                            }

                            $scope.ok = function (sendMailCancelClassForm) {
                                if (sendMailCancelClassForm.$valid && $scope.isMailFormatValid) {
                                    var modalOptions = {
                                        closeButtonText: 'Cancel',
                                        actionButtonText: 'OK',
                                        headerText: 'Cancel Class',
                                        bodyText: 'Are you sure you want to cancel this class?'
                                    };
                                    ModalService.showModal({}, modalOptions).then(function (result) {

                                        var mail = {
                                            addressMailTo: getToMail(),
                                            addressMailCc: getCcMail(),
                                            cancelReason: $scope.mail.content
                                        }
                                        $http.post("CourseClasses/CancelClass", {
                                            classID: id,
                                            mail: mail
                                        })
                                            .success(function (response) {
                                                if (response.success == true) {

                                                    ModalService.showModal({}, {
                                                        headerText: 'Cancel Class',
                                                        bodyText: 'Class is canceled successfully.'
                                                    });
                                                    $modalInstance.dismiss();
                                                    GetClassesOfCourse();

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
                            };

                            $scope.cancel = function () {
                                $modalInstance.dismiss();
                            };

                            function getSession(sessionId) {
                                for (var i = 0; i < $scope.sessions.length; i++) {
                                    if ($scope.sessions[i] == sessionId) {
                                        return $scope.sessions[i];
                                    }
                                }
                            }
                        }
                    ],
                });
            }

            $scope.openCancelReason = function (aClass) {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    templateUrl: 'templateCancelReason.html',
                    scope: $scope,
                    controller: [
                        '$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.cancelReason = aClass.CancelReason;
                            $scope.close = function () {
                                $modalInstance.dismiss();
                            };
                        }]
                })
            }
        }]);