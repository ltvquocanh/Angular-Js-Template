'use strict';
angular.module('mainApp').controller('ClassParticipant',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', '$timeout',
        'ModalService', 'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'Upload', 'AuthService', 'USER_ROLES', 'SETTINGS', 'ATTENDANCE_STATUS',
        function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal, $timeout,
            ModalService, moment, DTOptionsBuilder, DTColumnDefBuilder, Upload, AuthService, USER_ROLES, SETTINGS, ATTENDANCE_STATUS) {

            var vm = this;

            init();

            function init() {
                $scope.$parent.route = $state.current.name;
                $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withOption('bFilter', false)
                    .withOption('bInfo', false)
                    .withOption('bPaginate', false)
                    .withOption('bScrollCollapse', false)
                    .withOption('bLengthChange', false)
                    .withOption('columnDefs', [{ "sortable": false, "targets": [0] }])
                
                //TODO: need to replace by configured link later, use hard coded value for now
                $scope.hrmProjectLink = 'https://hrm.tma.com.vn/index.php/bmo/bmoGroupManagement/unitId/';

                getCurrentHostUrl();

                $scope.classId = $stateParams.id;

                getParticipants($scope.classId);

                $scope.attendanceOptions = [
                    {
                        label: '---',
                        value: 0
                    },
                    {
                        label: 'X',
                        value: 1
                    },
                    {
                        label: 'A',
                        value: 2
                    },
                    {
                        label: 'AR',
                        value: 3
                    }
                ];

                $scope.openPopovers = [];
                $scope.hasComments = [];
                $scope.hasParticipantSessions = [];
            }

            function getCurrentHostUrl() {
                $http({
                    method: "GET",
                    url: "ClassParticipant/GetCurrentHostUrl",
                }).success(function (response) {
                    if (response.success) {
                        $scope.url = response.data + "/#/viewcourse/";
                    }
                    else {
                        ModalService.showModal({}, {
                            headerText: 'Error',
                        });
                    }
                }).error(function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                    });
                })
            }

            $scope.getAttendanceStatus = function (participantId, sessionId) {
                for (var i = 0; i < $scope.participants.length; i++) {
                    var participant = $scope.participants[i];

                    if (participant.Id == participantId) {
                        var attendanceRecords = participant.AttendanceRecords;

                        for (var j = 0; j < attendanceRecords.length; j++) {
                            if (attendanceRecords[j].ClassSessionId == sessionId) {
                                return attendanceRecords[j].Status;
                            }
                        }
                    }
                }
                return 0;
            }

            $scope.onStatusChange = function (childScope, participantId, sessionId, status) {
                childScope.editMode = false;

                for (var i = 0; i < $scope.participants.length; i++) {
                    var participant = $scope.participants[i];

                    if (participant.Id == participantId) {
                        var attendanceRecords = participant.AttendanceRecords;

                        for (var j = 0; j < attendanceRecords.length; j++) {
                            if (attendanceRecords[j].ClassSessionId == sessionId) {
                                attendanceRecords[j].Status = status;

                                if (status == 0) {
                                    attendanceRecords[j].Comment = null;

                                    for (var k = 0; k < $scope.sessions.length; k++) {
                                        if ($scope.sessions[k].Id == sessionId) {
                                            $scope.hasComments[(k + 1) + $scope.sessions.length * i - 1] = false;
                                        }
                                    }
                                }

                                return;
                            }
                        }

                        attendanceRecords.push({
                            RegistrationId: participantId,
                            ClassSessionId: sessionId,
                            Status: status
                        });

                        return;
                    }
                }
            }

            $scope.getAttendancePercentage = function (participantId) {
                for (var i = 0; i < $scope.participants.length; i++) {
                    var participant = $scope.participants[i];

                    if (participant.Id == participantId) {
                        var totalSessionNumber = $scope.sessions.length;
                        var attendedSessionNumber = 0;
                        var attendanceRecords = participant.AttendanceRecords;

                        for (var j = 0; j < attendanceRecords.length; j++) {
                            if (attendanceRecords[j].Status == 1) {
                                attendedSessionNumber++;
                            }
                        }

                        if (totalSessionNumber == 0) {
                            return 0;
                        }
                        else {
                            if (participant.RegistrationSessions.length != 0) {
                                totalSessionNumber = participant.RegistrationSessions.length;
                            }

                            var result = (100 * attendedSessionNumber / totalSessionNumber).toFixed(1);

                            if (result == 0 || result == NaN) {
                                return 0;
                            }
                            else {
                                return result;
                            }
                        }
                    }
                }

                return 0;
            }

            $scope.getAttendanceStatusText = function (status) {
                for (var i = 0; i < $scope.attendanceOptions.length; i++) {
                    var option = $scope.attendanceOptions[i];

                    if (option.value == status) {
                        return option.label;
                    }
                }

                return $scope.attendanceOptions[0].label;
            }

            $scope.dtInstanceCallback = function (dtInstance) {
                dtInstance.DataTable.on('order.dt', function () {
                    dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
                });
            }

            function getParticipants(classId) {
                if (classId != "") {
                    $http({
                        method: "GET",
                        url: "ClassParticipant/GetParticipants",
                        params: {
                            classId: classId
                        },
                    }).success(function (response) {
                        if (response.success) {
                            if (response.data.participants.length > 0) {
                                $scope.participants = response.data.participants;
                                $scope.backupedOriginalParticipants = angular.copy($scope.participants);
                                $scope.sessions = response.data.sessions;
                                $scope.sessionsIsCancel = response.data.sessionsIsCancel;
                                setOpenPopoversAndHasComments();
                                setHasParticipantSessions();
                                isClassCancel($scope.sessionsIsCancel);
                                $scope.isDisableHref = false;
                            } else {
                                $scope.participants = null;
                                $scope.isDisableHref = true;
                            }
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
                    })
                }
            }

            $scope.getSessionsNotCompletedAttendaceRecord = function () {
                var attendanceRecords = [];

                for (var i = 0; i < $scope.backupedOriginalParticipants.length; i++) {
                    if ($scope.hasParticipantSessions[i] != 2 || $scope.hasParticipantSessions[i] != 3) {
                        var participant = $scope.backupedOriginalParticipants[i];
                        attendanceRecords = attendanceRecords.concat(participant.AttendanceRecords);
                    }
                }
                var idSessions = [];
                angular.forEach(attendanceRecords, function (attendanceRecord, key) {
                    if (attendanceRecord.Status == 0 && idSessions.indexOf(attendanceRecord.ClassSessionId) == -1) {
                        idSessions.push(attendanceRecord.ClassSessionId);
                    }
                });
                return idSessions;
            }

            $scope.save = function () {
                var attendanceRecords = [];

                for (var i = 0; i < $scope.participants.length; i++) {
                    // not register session || withdraw
                    if ($scope.hasParticipantSessions[i] != 2 || $scope.hasParticipantSessions[i] != 3) {
                        var participant = $scope.participants[i];
                        attendanceRecords = attendanceRecords.concat(participant.AttendanceRecords);
                    }
                }

                $http.post("ClassParticipant/UpdateAttendanceStatus", {
                    classId: $scope.classId,
                    attendanceRecords: attendanceRecords
                }).success(function (response) {
                    if (response.success) {
                        $scope.backupedOriginalParticipants = angular.copy($scope.participants);
                        ModalService.showModal({}, {
                            headerText: 'Update Status',
                            bodyText: response.message
                        });
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
                })
            }

            $scope.reset = function () {
                $scope.isDisableButton = true;
                $timeout(resetParticipant, 50);

                if ($scope.participants != null) {
                    $scope.isDisableHref = false;
                } else {
                    $scope.isDisableHref = true;
                }
            }

            function resetParticipant() {
                $scope.participants = angular.copy($scope.backupedOriginalParticipants);
                $scope.isDisableButton = false;
                setOpenPopoversAndHasComments();
            }

            $scope.exportParticipants = function () {
                var urlAction = "ClassParticipant/ExportParticipants?classId=" + $scope.classId;
                window.location.assign(urlAction);
            }

            $scope.openModalImportParticipants = function (classId) {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    templateUrl: 'importParticipantsDialog.html',
                    scope: $scope,
                    controller: [
                        '$scope', '$modalInstance', function ($scope, $modalInstance) {

                            $scope.import = function (importParticipantsForm) {
                                if (importParticipantsForm.$valid) {
                                    $scope.isSendingRequest = true;
                                    if ($scope.importFile == null) {
                                        ModalService.showModal({}, {
                                            headerText: 'Import Attendance Data',
                                            bodyText: 'Please browse an import file to proceed'
                                        });
                                        $scope.isSendingRequest = false;
                                        return;
                                    }
                                    Upload.upload({
                                        url: 'ClassParticipant/ImportParticipants',
                                        data: {
                                            classId: classId,
                                            file: $scope.importFile
                                        }
                                    }).then(function (response) {
                                        ModalService.showModal({}, {
                                            headerText: 'Import Attendance Data',
                                            bodyText: response.data.message
                                        });
                                        $scope.isSendingRequest = false;
                                        $modalInstance.dismiss();
                                        getParticipants(classId);
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

            $scope.openModalAttendanceReport = function () {
                $scope.report = {};
                $scope.report.textHeaderEmail = $("#headerEmail").html();

                var modalInstance = $modal.open({
                    size: 'lg',
                    animation: true,
                    backdrop: 'static',
                    templateUrl: 'sessionAttendanceReport.html',
                    scope: $scope,
                    controller: [
                        '$modalInstance', function ($modalInstance) {
                            $scope.reportSessions = [];
                            $scope.report.canReport = true;
                            
                            angular.forEach($scope.sessions, function (session, key) {
                                session.StartDate = moment(session.StartTime)
                                                    .format(SETTINGS.DATEFORMAT);
                                
                                if (moment(session.EndTime).unix() < moment(Date.now()).unix()) {
                                    $scope.reportSessions.push(session);
                                }
                            });

                            $scope.$watch('report.sessionSelected', function (newValue, oldValue) {

                                if (newValue && newValue !== undefined && newValue !== null) {

                                    $scope.report.canReport = $scope.getSessionsNotCompletedAttendaceRecord().indexOf(newValue.Id) == -1;
                                    if ($scope.report.canReport) {
                                        $scope.getAttendanceReportClassSession($scope.report.sessionSelected.Id);
                                    }
                                   
                                }
                            });

                            $scope.getDetailAttendance = function (attendanceStatus) {
                                return ATTENDANCE_STATUS[attendanceStatus].Name;
                            }

                            $scope.sendAttendanceReport = function (sendMailAttendanceSessionForm, sessionId, textHeaderEmail) {
                                if (!sendMailAttendanceSessionForm.$valid) {
                                    return;
                                }
                                var content = $("#capture-email").html();
                                $scope.report.isSendingRequest = true;

                                $scope.attendanceReportClassSession.TextHeaderEmail = textHeaderEmail;
                                $scope.attendanceReportClassSession.SessionId = sessionId;
                                $scope.attendanceReportClassSession.toEmails = $scope.report.toEmails.trim().split(",");
                                $scope.attendanceReportClassSession.ccEmails = $scope.report.ccEmails.trim().split(",");

                                angular.forEach($scope.attendanceReportClassSession.toEmails, function (toEmail, key) {
                                    toEmail = toEmail.trim();
                                  
                                });

                                angular.forEach($scope.attendanceReportClassSession.ccEmails, function (ccEmail, key) {
                                    ccEmail = ccEmail.trim();

                                });

                                $scope.attendanceReportClassSession.CourseDate =
                                moment($scope.attendanceReportClassSession.CourseDate)
                                                   .format(SETTINGS.DATEFORMAT)
                                $scope.attendanceReportClassSession.CourseDate = new Date($scope.attendanceReportClassSession.CourseDate.replace("-", ""));
                                $http.post("ClassParticipant/SendAttendanceReportClassSession", {
                                    attendanceReportClassSessionDto : $scope.attendanceReportClassSession,
                                    content: content,
                                }).success(function (response) {
                                    if (response.success) {
                                        $scope.report.isSendingRequest = false;
                                        ModalService.showModal({}, {
                                            headerText: 'Email Attendance Report',
                                            bodyText: response.message
                                        }).then(function (result) {
                                            $modalInstance.dismiss();
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

                            $scope.getAttendanceReportClassSession = function (sessionId) {
                                $http({
                                    method: "GET",
                                    url: "ClassParticipant/getAttendanceReportClassSession",
                                    params: {
                                        sessionId: sessionId
                                    },
                                }).success(function (response) {
                                    if (response.success) {
                                        $scope.attendanceReportClassSession = response.data;
                                        console.log($scope.attendanceReportClassSession);
                                        var tagOfEmail = "@tma.com.vn";
                                        $scope.report.toEmails = ($scope.attendanceReportClassSession.toEmails + "").replace(/\,/g, ', ');
                                        $scope.report.ccEmails = ($scope.attendanceReportClassSession.ccEmails + "").replace(/\,/g,', ');
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
                                })
                            }

                            $scope.cancel = function () {
                                $modalInstance.dismiss();
                            };
                        }
                    ]
                });

            }

            $scope.hasSaveAndResetPermission = function () {
                return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                                USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
            }

            $scope.hasImportAndExportPermission = function () {
                return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                                USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
            }

            $scope.dynamicPopover = {
                templateUrl: 'myPopoverTemplate.html',
                title: 'Comment'
            };

            function setOpenPopoversAndHasComments() {
                $scope.openPopovers = [];
                $scope.hasComments = [];
                for (var i = 0; i < $scope.participants.length; i++) {
                    var participant = $scope.participants[i];

                    for (var j = 0; j < $scope.sessions.length; j++) {
                        var session = $scope.sessions[j];
                        var attendanceRecords = participant.AttendanceRecords;
                        var openPopover = false;
                        var hasComment = false;

                        $scope.openPopovers.push(openPopover);

                        for (var k = 0; k < attendanceRecords.length; k++) {
                            if (attendanceRecords[k].ClassSessionId == session.Id
                                && attendanceRecords[k].Comment != null) {
                                hasComment = true;
                            }
                        }

                        $scope.hasComments.push(hasComment);
                    }
                }
            }

            $scope.closeAllPopover = function () {
                for (var i = 0; i < $scope.openPopovers.length; i++) {
                    $scope.openPopovers[i] = false;
                }
            }

            $scope.onCommentChange = function (participantId, sessionId, status, comment) {
                for (var i = 0; i < $scope.participants.length; i++) {
                    var participant = $scope.participants[i];

                    if (participant.Id == participantId) {
                        var attendanceRecords = participant.AttendanceRecords;

                        for (var j = 0; j < $scope.sessions.length; j++) {
                            if ($scope.sessions[j].Id == sessionId) {
                                if (comment == null || comment.length == 0) {
                                    $scope.hasComments[(j + 1) + $scope.sessions.length * i - 1] = false;
                                } else {
                                    $scope.hasComments[(j + 1) + $scope.sessions.length * i - 1] = true;
                                }
                            }
                        }

                        for (var k = 0; k < attendanceRecords.length; k++) {
                            if (attendanceRecords[k].ClassSessionId == sessionId) {
                                attendanceRecords[k].Comment = comment;
                                return;
                            }
                        }

                        attendanceRecords.push({
                            RegistrationId: participantId,
                            ClassSessionId: sessionId,
                            Status: status,
                            Comment: comment
                        });

                        return;
                    }
                }
            }

            $scope.getAttendanceComment = function (participantId, sessionId) {
                for (var i = 0; i < $scope.participants.length; i++) {
                    var participant = $scope.participants[i];

                    if (participant.Id == participantId) {
                        var attendanceRecords = participant.AttendanceRecords;

                        for (var j = 0; j < attendanceRecords.length; j++) {
                            if (attendanceRecords[j].ClassSessionId == sessionId) {
                                return attendanceRecords[j].Comment;
                            }
                        }
                    }
                }

                return null;
            }

            $scope.closeOtherPopover = function (positionPopover) {
                for (var i = 0; i < $scope.openPopovers.length; i++) {
                    if (i != positionPopover) {
                        $scope.openPopovers[i] = false;
                    }
                }
            }

            function setHasParticipantSessions() {
                // code below initalize default status (X o , W) for attedance tracking of TTC .
                $scope.hasParticipantSessions = [];
                //1: has participant, 2: has not participant, 3: withdraw
                // nqhai recomment: not register session || withdraw
                //nqhai recomment : //1: trainee attend class (X), 2: trainee don't register classs ([o]  & can not edit)], 3: trainee withdraw (W)

                for (var i = 0; i < $scope.participants.length; i++) {
                    var participant = $scope.participants[i];

                    for (var j = 0; j < $scope.sessions.length; j++) {
                        var session = $scope.sessions[j];
                        var registrationSessions = participant.RegistrationSessions;
                        var attendanceRecords = participant.AttendanceRecords;
                        var hasParticipantSession = 2;

                        if (registrationSessions.length == 0) {
                            //register whole class (all sessions)
                            for (var k = 0; k < attendanceRecords.length; k++) {
                                if (attendanceRecords[k].ClassSessionId == session.Id) {
                                    hasParticipantSession = 1;
                                }
                            }

                            if (hasParticipantSession == 2) {
                                hasParticipantSession = 3;
                            }
                        }
                        for (var k = 0; k < registrationSessions.length; k++) {
                            if (registrationSessions[k].ClassSessionId == session.Id) {
                                hasParticipantSession = 1;

                                if (registrationSessions[k].IsWithdraw) {
                                    hasParticipantSession = 3
                                }
                            }
                        }

                        $scope.hasParticipantSessions.push(hasParticipantSession);
                    }
                }
            }

            function isClassCancel(sessions) {
                for (var i = 0; i < sessions.length; i++) {
                    if (sessions[i].IsCancel) {
                        $scope.isClassCancel = true
                    }
                    else {
                        $scope.isClassCancel = false;
                        return;
                    }
                }
            }
        }]);
