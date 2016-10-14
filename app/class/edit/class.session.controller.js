'use strict';
angular.module('mainApp').controller('ClassTimePlace',
    ['$scope', '$rootScope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', 'ModalService',
        'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS', 'AuthService', 'USER_ROLES',
    function ($scope, $rootScope, $http, cfpLoadingBar, $state, $stateParams, $modal, ModalService,
        DTOptionsBuilder, DTColumnDefBuilder, SETTINGS, AuthService, USER_ROLES) {

        var vm = this;
        var classId = $stateParams.id;
        init();

        function init() {

            $rootScope.currentDateTime = Date.now();
            $scope.dateFormat = SETTINGS.DATEFORMAT;
            $scope.$parent.route = $state.current.name;
            $scope.isClassCancel = false;

            $scope.dtOptions = DTOptionsBuilder.newOptions()
                  .withOption('bFilter', false)
                  .withOption('bInfo', false)
                  .withOption('bPaginate', false)
                  .withOption('bLengthChange', false)
                  .withOption('columnDefs', [{ "sortable": false, "targets": [0] }])

            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(7).notSortable(),
            ];

            $scope.dtInstanceCallback = function (dtInstance) {
                dtInstance.DataTable.on('order.dt', function () {
                    dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
                });
            }

            getClassSessions();
        }

        function getClassSessions() {
            if ($scope.classId != "") {
                $http.get("ClassSession/GetClassSessions", {
                    params: {
                        classId: $scope.classId,
                    },
                }).success(function (response) {
                    if (response.success) {
                        $scope.sessions = response.data;
                        for (var i = 0; i < $scope.sessions.length; i++) {
                            if ($scope.sessions[i].StartTime != null && $scope.sessions[i].EndTime != null) {
                                var startTime = $scope.sessions[i].StartTime;
                                $scope.sessions[i].StartTime = parseInt(startTime.substr(6));
                                var endTime = $scope.sessions[i].EndTime;
                                $scope.sessions[i].EndTime = parseInt(endTime.substr(6));
                            }
                        }
                        isClassCancel($scope.sessions);
                        isClassDone($scope.sessions);
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

        function getClassSession(sessionId) {
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
                headerText: 'Delete Class Session',
                bodyText: 'Are you sure you want to delete this session?'
            };

            ModalService.showModal({}, modalOptions).then(function (result) {
                $http.post("ClassSession/DeleteClassSession", {
                    sessionId: sessionId
                }).success(function (response) {
                    if (response.success) {
                        ModalService.showModal({}, {
                            headerText: 'Success',
                            bodyText: response.message
                        });
                        getClassSessions();
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

        $scope.openModalEditClassSession = function (sessionId) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'editClassSessionDialog.html',
                scope: $scope,
                controller: [
                    '$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.isStartDateIncorrect = false;
                        $scope.isEndDateIncorrect = false;
                        $scope.isSendingRequest = false;
                        $scope.isOpenStartDate = false;
                        $scope.currentDateTime = Date.now();

                        $scope.openStartDateCalendar = function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $scope.isOpenStartDate = true;
                            $scope.isOpenEndDate = false;
                        };

                        $scope.isOpenEndDate = false;
                        $scope.openEndDateCalendar = function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $scope.isOpenEndDate = true;
                            $scope.isOpenStartDate = false;
                        };

                        $scope.session = getClassSession(sessionId);
                        GetClassTrainers();

                        $scope.sessionUpdate = angular.copy($scope.session);


                        if ($scope.sessionUpdate.StartTime != null && $scope.sessionUpdate.EndTime != null) {
                            var startTime = $scope.sessionUpdate.StartTime;
                            var endTime = $scope.sessionUpdate.EndTime;

                            $scope.sessionUpdate.StartTime =
                                moment($scope.sessionUpdate.StartTime).format(SETTINGS.DATEFORMAT);

                            $scope.sessionUpdate.EndTime =
                                moment($scope.sessionUpdate.EndTime).format(SETTINGS.DATEFORMAT);
                        }
                        else {
                            $scope.sessionUpdate.StartTime = "";
                            $scope.sessionUpdate.EndTime = "";
                        }

                        var isStartDateChange = false;
                        var isEndDateChange = false;

                        $scope.onStartTimeChange = function () {
                            isStartDateChange = true;
                            isEndDateChange = false;
                            checkDate(endTime);
                        }

                        $scope.onEndTimeChange = function () {
                            isEndDateChange = true;
                            isStartDateChange = false;
                            checkDate(startTime);
                        }

                        function checkDate(date) {
                            if (isStartDateChange) {
                                var currentDate = new Date(Date.now());
                                if (!moment($scope.sessionUpdate.StartTime).isAfter(Date.now())) {
                                    $scope.isStartDateIncorrect = true;
                                    $scope.messageErrorStartTimeLessCurrentDate = "Start time should not be in the past";
                                    $scope.isDateCheck = true;

                                } else {
                                    $scope.isStartDateIncorrect = false;
                                    $scope.messageErrorStartTimeLessCurrentDate = "";
                                    $scope.isDateCheck = false;
                                }
                                if ($scope.sessionUpdate.StartTime != undefined
                                     && $scope.sessionUpdate.EndTime != null) {
                                    if (moment($scope.sessionUpdate.StartTime).isAfter($scope.sessionUpdate.EndTime) ||
                                    moment($scope.sessionUpdate.StartTime).isSame($scope.sessionUpdate.EndTime)) {

                                        $scope.isStartTimeGreaterThanEndTime = true;
                                        $scope.messageErrorEndTimeGreaterStartTime = "End time must be greater than start time";
                                        $scope.isDateCheck = true;
                                    } else {
                                        $scope.isStartTimeGreaterThanEndTime = false;
                                        $scope.messageErrorEndTimeGreaterStartTime = "";
                                        $scope.isDateCheck = false;
                                    }
                                }

                                startTime = $scope.sessionUpdate.StartTime;
                            }

                            if (isEndDateChange) {
                                if (moment($scope.sessionUpdate.EndTime).isBefore(Date.now())) {
                                    $scope.isEndDateIncorrect = true;
                                    $scope.messageErrorEndTimeLessCurrentDate = "End time should not be in the past";
                                    $scope.isDateCheck = true;
                                } else {
                                    $scope.isEndDateIncorrect = false;
                                    $scope.messageErrorEndTimeLessCurrentDate = "";
                                    $scope.isDateCheck = false;
                                }

                                if ($scope.sessionUpdate.EndTime != undefined) {
                                    if (!moment(getStandardDateTime($scope.sessionUpdate.StartTime)).isBefore($scope.sessionUpdate.EndTime, 'minute') && $scope.sessionUpdate.StartTime != "") {

                                        $scope.isStartTimeGreaterThanEndTime = true;
                                        $scope.messageErrorEndTimeGreaterStartTime = "End time must be greater than start time";
                                        $scope.isDateCheck = true;
                                    } else {

                                        $scope.isStartTimeGreaterThanEndTime = false;
                                        $scope.messageErrorEndTimeGreaterStartTime = "";
                                        $scope.isDateCheck = false;
                                    }
                                }
                                endTime = $scope.sessionUpdate.EndTime;
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

                        $scope.ok = function (editClassSessionForm) {

                            if (editClassSessionForm.$valid && !$scope.isStartDateIncorrect && $scope.isInADay()
                                && !$scope.isEndDateIncorrect && !$scope.isStartTimeGreaterThanEndTime
                                && !$scope.isRegistrationDeadlineGreaterThanStartTime() && !$scope.isExistSessionName) {
                                $scope.isSendingRequest = true;
                                if (!moment.isDate($scope.sessionUpdate.StartTime)) {
                                    $scope.sessionUpdate.StartTime = new Date(getStandardDateTime($scope.sessionUpdate.StartTime));
                                }

                                if (!moment.isDate($scope.sessionUpdate.EndTime)) {
                                    $scope.sessionUpdate.EndTime = new Date(getStandardDateTime($scope.sessionUpdate.EndTime));
                                }

                                $http.post("ClassSession/UpdateClassSession", {
                                    sessionDto: $scope.sessionUpdate
                                }).success(function (response) {
                                    if (response.success) {
                                        $modalInstance.dismiss();
                                        ModalService.showModal({}, {
                                            headerText: 'Edit Class Session',
                                            bodyText: response.message
                                        });
                                        getClassSessions();
                                    } else {
                                        ModalService.showModal({}, {
                                            headerText: 'Error',
                                            bodyText: response.message
                                        });
                                        $scope.isSendingRequest = false;
                                    }
                                }).error(function (response) {
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

                        function GetClassTrainers() {
                            $http.get("ClassSession/GetClassTrainers", {
                                params: {
                                    classId: classId,
                                },
                            }).success(function (response) {
                                if (response.success) {
                                    $scope.classTrainers = response.data;
                                    $scope.registrationDeadline = moment(response.data[0].RegistrationDeadline)
                                                   .format(SETTINGS.DATEFORMAT);
                                }
                            }).error(function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.message
                                });
                            });
                        }

                        $scope.isStartTimeCorrect = function () {
                            if (moment($scope.sessionUpdate.StartTime).isBefore(Date.now())) {
                                return false;
                            }
                            return true;
                        }

                        $scope.sessionNameSetArgs = function (val, el, attrs, ngModel) {
                            return {
                                sessionName: val,
                                classId: classId,
                                sessionId: $scope.sessionUpdate.Id
                            };
                        }

                        //check start time and end time in a day
                        $scope.isInADay = function () {
                            var newStart = document.getElementById('inputStarDate').value;
                            if (newStart == null || newStart == "") {
                                return true;
                            }
                            var startTime = new Date(newStart.replace("-", ""));
                            if (startTime != null) {
                                var monthStart = startTime.getMonth() + 1;
                                var yearStart = startTime.getFullYear();
                                var dayStart = startTime.getDate();
                                var hourStart = startTime.getHours();
                            }

                            var newEnd = document.getElementById('inputEndDate').value;
                            if (newEnd == null || newEnd == "") {
                                return true;
                            }
                            var endTime = new Date(newEnd.replace("-", ""));
                            if (endTime != null) {
                                var monthEnd = endTime.getMonth() + 1;
                                var yearEnd = endTime.getFullYear();
                                var dayEnd = endTime.getDate();
                                var hourEnd = endTime.getHours();
                            }

                            if ((yearStart == yearEnd && monthStart == monthEnd && dayStart == dayEnd) || startTime == null || endTime == null) {
                                return true;
                            }
                            return false;
                        }

                        $scope.isRegistrationDeadlineGreaterThanStartTime = function (startTime) {
                            var registrationDeadline = $scope.registrationDeadline;
                            if (registrationDeadline != undefined) {
                                if (!moment.isDate(registrationDeadline)) {
                                    registrationDeadline = new Date(registrationDeadline.replace("-", ""));
                                }
                            }
                            if (startTime != undefined) {
                                startTime = moment(startTime).format(SETTINGS.DATEFORMAT);
                                if (!moment.isDate(startTime)) {
                                    startTime = new Date(startTime.replace("-", ""));
                                }
                            }

                            if (startTime <= registrationDeadline) {
                                return true;
                            }
                            return false;
                        }
                    }
                ],
            });
        }

        $scope.openModalAddClassSession = function () {

            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'addClassSessionDialog.html',
                scope: $scope,
                controller: [
                    '$scope', '$modalInstance', function ($scope, $modalInstance) {
                        GetClassTrainers();
                        $scope.isOpenStartDate = false;
                        $scope.isSendingRequest = false;
                        $scope.newSession = {};
                        $scope.openStartDateCalendar = function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $scope.isOpenStartDate = true;
                            $scope.isOpenEndDate = false;
                        };

                        $scope.isOpenEndDate = false;
                        $scope.openEndDateCalendar = function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $scope.isOpenEndDate = true;
                            $scope.isOpenStartDate = false;
                        };

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

                        $scope.ok = function (addClassSessionForm) {

                            if (addClassSessionForm.$valid && $scope.isStartTimeCorrect() && $scope.isEndTimeCorrect()
                                && $scope.isStartTimeGreaterThanEndTime() && $scope.isInADay()
                                && !$scope.isRegistrationDeadlineGreaterThanStartTime() && !$scope.isExistSessionName) {
                                $scope.isSendingRequest = true;
                                $scope.newSession.classId = classId;

                                $http.post("ClassSession/AddClassSession", {
                                    sessionDto: $scope.newSession,
                                }).success(function (response) {
                                    $modalInstance.dismiss();
                                    if (response.success) {
                                        ModalService.showModal({}, {
                                            headerText: 'Add Class Session',
                                            bodyText: response.message
                                        });
                                        getClassSessions();

                                    } else {
                                        ModalService.showModal({}, {
                                            headerText: 'Error',
                                            bodyText: response.message
                                        });
                                        $scope.isSendingRequest = false;
                                    }
                                }).error(function (response) {
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

                        function GetClassTrainers() {
                            $http.get("ClassSession/GetClassTrainers", {
                                params: {
                                    classId: classId,
                                },
                            }).success(function (response) {
                                if (response.success) {
                                    $scope.classTrainers = response.data;
                                    $scope.registrationDeadline = moment(response.data[0].RegistrationDeadline)
                                                   .format(SETTINGS.DATEFORMAT);
                                }
                            }).error(function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.message
                                });
                            });
                        }

                        $scope.sessionNameSetArgs = function (val, el, attrs, ngModel) {
                            return {
                                sessionName: val,
                                classId: classId
                            };
                        };

                        $scope.getcurrentDate = function () {
                            return Date.now();
                        }

                        $scope.isRegistrationDeadlineGreaterThanStartTime = function (startTime) {
                            var registrationDeadline = $scope.registrationDeadline;
                            if (startTime != undefined) {
                                startTime = moment(startTime).format(SETTINGS.DATEFORMAT);
                                if (!moment.isDate(registrationDeadline)) {
                                    registrationDeadline = new Date(registrationDeadline.replace("-", ""));
                                }
                                if (!moment.isDate(startTime)) {
                                    startTime = new Date(startTime.replace("-", ""));
                                }
                            }

                            if (startTime <= registrationDeadline) {
                                return true;
                            }
                            return false;
                        }

                        $scope.isStartTimeCorrect = function () {
                            if (moment($scope.newSession.StartTime).isAfter(Date.now())) {
                                return true;
                            }
                            if ($scope.newSession.StartTime == null) {
                                return true;
                            }
                            return false;
                        }

                        $scope.isEndTimeCorrect = function () {
                            if (moment($scope.newSession.EndTime).isAfter(Date.now())) {
                                return true;
                            }
                            if ($scope.newSession.EndTime == null) {
                                return true;
                            }
                            return false;
                        }

                        //check start time and end time in a day
                        $scope.isInADay = function () {
                            var startTime = $scope.newSession.StartTime;
                            if (startTime != null) {
                                var monthStart = startTime.getUTCMonth() + 1;
                                var yearStart = startTime.getUTCFullYear();
                                var dayStart = startTime.getUTCDate();
                                var hourStart = startTime.getHours();
                            }

                            var endTime = $scope.newSession.EndTime;
                            if (endTime != null) {
                                var monthEnd = endTime.getUTCMonth() + 1;
                                var yearEnd = endTime.getUTCFullYear();
                                var dayEnd = endTime.getUTCDate();
                                var hourEnd = endTime.getHours();
                            }

                            if ((yearStart == yearEnd && monthStart == monthEnd && dayStart == dayEnd) || startTime == null || endTime == null) {
                                return true;
                            }
                            return false;
                        }

                        $scope.isStartTimeGreaterThanEndTime = false;

                        $scope.isStartTimeGreaterThanEndTime = function () {

                            if ($scope.newSession.StartTime == undefined) {
                                return true;
                            }
                            if (moment($scope.newSession.EndTime).isAfter($scope.newSession.StartTime, 'minute')) {
                                return true;
                            }
                            return false;
                        }
                    }
                ],
            });
        }

        $scope.openModalSendMeetingRequest = function (sessionId) {

            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'SendMeetingRequestDialog.html',
                size: 'lg',
                scope: $scope,
                controller: [
                    '$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.isStartTimeChange = false;
                        $scope.isOpenStartDate = false;
                        $scope.isEndTimeLessThenStartTime = false;

                        $scope.openStartDateCalendar = function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $scope.isOpenStartDate = true;
                            $scope.isOpenEndDate = false;
                        };

                        $scope.isOpenEndDate = false;
                        $scope.openEndDateCalendar = function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $scope.isOpenEndDate = true;
                            $scope.isOpenStartDate = false;
                        };


                        $scope.isSendMeetingRequest = false;
                        $scope.isSendingRequest = false;
                        $scope.participants = [];

                        var session = getClassSession(sessionId);

                        $scope.reminderMinute = [5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 120, 720, 1080, 1440];
                        $scope.reminder = [
                            "5 Minute", "10 Minute",
                            "15 Minute", "20 Minute",
                            "25 Minute", "30 Minute",
                            "35 Minute", "40 Minute",
                            "45 Minute", "60 Minute",
                            "2 Hours", "12 Hours", "18 Hours", "24 Hours",
                        ];
                        $scope.mail = {
                            to: "",
                            cc: "training@tma.com.vn; ",
                            subject: session.CourseName,
                            location: session.Room,
                            startTime: "",
                            endTime: "",
                            content: "",
                            minute: "15 Minute"
                        };

                        $scope.mail.startTime = moment(session.StartTime).format(SETTINGS.DATEFORMAT);

                        $scope.mail.endTime = moment(session.EndTime).format(SETTINGS.DATEFORMAT);

                        $scope.mail.startTime = new Date($scope.mail.startTime.replace("-", ""));
                        $scope.mail.endTime = new Date($scope.mail.endTime.replace("-", ""));

                        var sessionInfo = "<font size='3' color='black' face='Arial'><b>Dear All,</b></font> <br /><br />"
                                            + "<font size='3' color='black' face='Arial'>Please join us fully for the following course</font><br/><br/>"
                                            + "<font size='3' color='blue' face='Arial'><b>Course:</b></font>   " + "<font color='white' face='Arial'>_</font>" + "<font size='5' color='#C55A11' face='Arial'> " + session.CourseName + "</font>" + "<br/>"
                                            + "<font size='3' color='blue' face='Arial'><b>Session:</b></font>   " + "<font color='white'>_</font>" + "<font size='5' color='#C55A11' face='Arial'> " + session.Name + "</font>" + "<br/>"
                                            + "<font size='3' color='black' face='Arial'>Date:</font>" + "<font color='white' face='Arial'>_____</font>" + "<font size='3' color='black' face='Arial'>" + moment($scope.mail.startTime).format("MMM DD, YYYY") + "</font>" + "<br/>"
                                            + "<font size='3' color='black' face='Arial'>Time:</font>" + "<font color='white' face='Arial'>_____</font>" + "<font size='3' color='black' face='Arial'>" + moment($scope.mail.startTime).format("HH:mm") + " - " + moment($scope.mail.endTime).format("HH:mm") + "</font>" + "<br/>"
                                            + "<font size='3' color='black' face='Arial'>Duration:</font>" + "<font color='white' face='Arial'>__</font>" + "<font size='3' color='black' face='Arial'>" + session.Duration + " hours " + "</font>" + "<br/>"
                                            + "<font size='3' color='black' face='Arial'>Trainer:</font>" + "<font color='white' face='Arial'>___-</font>" + "<font size='3' color='black' face='Arial'>" + session.TrainerName + "</font>" + "<br/>"
                                            + (session.Room ? "<font size='3' color='black' face='Arial'>Location:</font> " + "<font color='white' face='Arial'>__</font>" + "<font size='3' color='black' face='Arial'>" + (session.Room + "</font>") : "") + "<br/><br/>"
                                            + "<font color='white' face='Arial'>_________________</font>" + "<font size='5' color='black' face='Arial'> <b>Attendance List</b></font> <br/><br/>"
                                            + "<font size='3' color='black' face='Arial'><b>No.</b></font>" + "<font color='white' face='Arial'>___</font>" + "<font size='3' color='black' face='Arial'><b>Full Name</b> </font>" + "<font color='white' face='Arial'>________________________</font>" + "<font size='3' color='black' face='Arial'> <b>Project/Deparment</b> </font><br/>";

                        var attandanceList = "";
                        var autoMessage = "<br/>-----------------------------------------------------------------------<br/>"
                            + "<font size='2' face='Arial'>"
                                + "This message is automatically generated by the Training Tool<br />"
                                + "Please contact PMO Tools team at <font size='2' color='blue' >pmo_tools@tma.com.vn</font> if there is any issue about this tool</font><br/><br/>"

                            + "<font size='2' color='#1D5d97' face='Palatino Linotype'>This e-mail and any attachments are TMA Solutions property, are confidential, "
                            + "and are intended solely for the use of the individual or entity to whom this e-mail is addressed."
                            + "If you are not one of the named recipient(s) or otherwise have reason to believe "
                            + "that you have received this message in error, "
                            + "please notify the sender, delete and ignore the contents</font>";

                        $http.post("ClassParticipant/GetParticipantForMeetingRequest", {
                            classId: session.ClassId,

                        }).success(function (response) {
                            if (response.success) {
                                $scope.participants = response.data;

                                if ($scope.participants.length == 0) {
                                    ModalService.showModal({}, {
                                        headerText: 'Error',
                                        bodyText: "Session has no participant"
                                    });
                                } else {
                                    var toArray = [];
                                    var ccArray = [];
                                    var index = 1;
                                    for (var i = 0 ; i < $scope.participants.length; i++) {
                                        if ($scope.participants[i].Status != 4) {
                                            if (!containsObject($scope.participants[i].ManagerUsername, ccArray)) {
                                                ccArray.push($scope.participants[i].ManagerUsername);
                                            }

                                            toArray.push($scope.participants[i].Username);

                                            var participantName = $scope.participants[i].FullName + " ";

                                            var lengthName = 32 - $scope.participants[i].FullName.length;

                                            for (var j = 0; j < lengthName; j++) {
                                                participantName += "<font color='white' face='Arial'>_</font>";
                                            }

                                            $scope.participants[i].FullName = participantName + " ";

                                            attandanceList += "<font color='white' face='Arial'>_</font>" + (index++) + "<font color='white' face='Arial'>____</font>"
                                                + $scope.participants[i].FullName + $scope.participants[i].ProjectName + "<br/>";
                                        }
                                    }

                                    $scope.mail.content = sessionInfo + attandanceList + autoMessage;

                                    if(session.TrainerUsername != null) {
                                        toArray.push(session.TrainerUsername);
                                    }
                                    
                                    for (var i = 0; i < toArray.length; i++) {
                                        $scope.mail.to += toArray[i] + "@tma.com.vn; ";
                                    }

                                    for (var i = 0; i < ccArray.length; i++) {
                                        $scope.mail.cc += ccArray[i] + "@tma.com.vn; ";
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

                        //check start time and end time in a day
                        $scope.isInADay = function () {
                            var startTime = $scope.mail.startTime;
                            if (startTime != null) {
                                var monthStart = startTime.getUTCMonth() + 1;
                                var yearStart = startTime.getUTCFullYear();
                                var dayStart = startTime.getDate();
                            }

                            var endTime = $scope.mail.endTime;
                            if (endTime != null) {
                                var monthEnd = endTime.getUTCMonth() + 1;
                                var yearEnd = endTime.getUTCFullYear();
                                var dayEnd = endTime.getDate();
                            }

                            if ((yearStart == yearEnd && monthStart == monthEnd && dayStart == dayEnd)
                                || startTime == null || endTime == null) {
                                return true;
                            }
                            return false;
                        }

                        $scope.onStartTimeChange = function () {
                            $scope.isStartTimeChange = true;

                            if (moment($scope.mail.startTime).isBefore(Date.now())) {
                                $scope.isStartTimeInThePast = true;
                            } else {
                                $scope.isStartTimeInThePast = false;
                            }

                            if (!isObjectUndefine($scope.mail.startTime)) {

                                $scope.mail.endTime = angular.copy($scope.mail.startTime);
                                $scope.mail.endTime.setHours($scope.mail.endTime.getHours() + session.Duration);

                                initializeEmailContent();
                            }

                            if (moment($scope.mail.endTime).isBefore(Date.now()) && $scope.mail.endTime != null) {
                                $scope.isEndTimeInThePast = true;
                            } else {
                                $scope.isEndTimeInThePast = false;
                            }

                            if (moment($scope.mail.endTime).isBefore($scope.mail.startTime) && $scope.mail.endTime != null) {
                                $scope.isEndTimeLessThenStartTime = true;
                            } else {
                                $scope.isEndTimeLessThenStartTime = false;
                            }
                        }

                        $scope.onEndTimeChange = function () {

                            if (moment($scope.mail.endTime).isBefore(Date.now()) && $scope.mail.endTime != null) {
                                $scope.isEndTimeInThePast = true;
                            } else {
                                $scope.isEndTimeInThePast = false;
                            }

                            if (!isObjectUndefine($scope.mail.endTime)) {
                                initializeEmailContent();
                            }

                            if (moment($scope.mail.endTime).isBefore($scope.mail.startTime) && $scope.mail.endTime != null) {
                                $scope.isEndTimeLessThenStartTime = true;
                            } else {
                                $scope.isEndTimeLessThenStartTime = false;
                            }
                        }

                        function initializeEmailContent() {

                            var diffMs = ($scope.mail.endTime.getTime() - $scope.mail.startTime.getTime());

                            var diffDays = Math.round(diffMs / 86400000); // days
                            var diffHours = Math.round((diffMs % 86400000) / 3600000); // hours
                            var diffMinutes = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

                            var temp = $scope.content;

                            sessionInfo = "<font size='3' color='black' face='Arial'><b>Dear All,</b></font> <br /><br />"
                                            + "<font size='3' color='black' face='Arial'>Please join us fully for the following course</font><br/><br/>"
                                            + "<font size='3' color='blue' face='Arial'><b>Course:</b></font>   " + "<font color='white' face='Arial'>_</font>" + "<font size='5' color='#C55A11' face='Arial'> " + session.CourseName + "</font>" + "<br/>"
                                            + "<font size='3' color='blue' face='Arial'><b>Session:</b></font>   " + "<font color='white' face='Arial'>_</font>" + "<font size='5' color='#C55A11' face='Arial'> " + session.Name + "</font>" + "<br/>"
                                            + "<font size='3' color='black' face='Arial'>Date:</font>" + "<font color='white' face='Arial'>_____</font>" + "<font size='3' color='black' face='Arial'>" + moment($scope.mail.startTime).format("MMM DD, YYYY") + "</font>" + "<br/>"
                                            + "<font size='3' color='black' face='Arial'>Time:</font>" + "<font color='white' face='Arial'>_____</font>" + "<font size='3' color='black' face='Arial'>" + moment($scope.mail.startTime).format("HH:mm") + " - " + moment($scope.mail.endTime).format("HH:mm") + "</font>" + "<br/>"
                                            + "<font size='3' color='black' face='Arial'>Duration:</font>" + "<font color='white' face='Arial'>__</font>" + "<font size='3' color='black' face='Arial'>" + (diffDays == 0 ? "" : (diffDays + " day, ")) + diffHours + (diffMinutes > 0 ? (":" + diffMinutes) : "") + " hours " + "</font>" + "<br/>"
                                            + "<font size='3' color='black' face='Arial'>Trainer:</font>" + "<font color='white' face='Arial'>___-</font>" + "<font size='3' color='black' face='Arial'>" + session.TrainerName + "</font>" + "<br/>"
                                            + (session.Room ? "<font size='3' color='black' face='Arial'>Location:</font> " + "<font color='white'>__</font>" + "<font size='3' color='black' face='Arial'>" + (session.Room + "</font>") : "") + "<br/><br/>"
                                            + "<font color='white' face='Arial'>_________________</font>" + "<font size='5' color='black' face='Arial'> <b>Attendance List</b></font> <br/><br/>"
                                            + "<font size='3' color='black' face='Arial'><b>No.</b></font>" + "<font color='white' face='Arial'>___</font>" + "<font size='3' color='black' face='Arial'><b>Full Name</b> </font>" + "<font color='white' face='Arial'>________________________</font>" + "<font size='3' color='black' face='Arial'> <b>Project/Deparment</b> </font><br/>";

                            $scope.mail.content = sessionInfo + attandanceList + autoMessage;

                            sessionInfo = temp;
                        }

                        $scope.ok = function (sendMeetingRequestForm) {

                            if (sendMeetingRequestForm.$valid && $scope.isInADay() && !$scope.isEndTimeLessThenStartTime) {
                                var modalOptions = {
                                    closeButtonText: 'Cancel',
                                    actionButtonText: 'OK',
                                    headerText: 'Send Request',
                                    bodyText: 'Are you sure you want to send request for this session?'
                                };

                                ModalService.showModal({}, modalOptions).then(function (result) {
                                    $scope.isSendingRequest = true;

                                    if (!moment.isDate($scope.mail.startTime)) {
                                        $scope.mail.startTime = new Date($scope.mail.startTime.replace("-", ""));
                                    }

                                    if (!moment.isDate($scope.mail.endTime)) {
                                        $scope.mail.endTime = new Date($scope.mail.endTime.replace("-", ""));
                                    }

                                    var mail = {
                                        to: $scope.mail.to,
                                        cc: $scope.mail.cc,
                                        subject: $scope.mail.subject,
                                        location: $scope.mail.location,
                                        startTime: $scope.mail.startTime,
                                        endTime: $scope.mail.endTime,
                                        content: $scope.mail.content,
                                        reminderMinute: $scope.mail.minute.split(" ", 1)[0]
                                    }

                                    $http.post("ClassSession/SendClassSessionMeetingRequest", {
                                        sessionId: sessionId,
                                        mail: mail,

                                    }).success(function (response) {
                                        if (response.success) {
                                            angular.forEach($scope.sessions, function (session, index) {
                                                if (session.Id === sessionId) {
                                                    $scope.sessions[index].IsMeetingRequestSent = true;
                                                }
                                            });

                                            ModalService.showModal({}, {
                                                headerText: 'Success',
                                                bodyText: response.message
                                            });
                                            $scope.isSendMeetingRequest = true;

                                            if ($scope.isSendMeetingRequest) {
                                                $modalInstance.dismiss();
                                                getClassSessions();
                                                $scope.isSendingRequest = false;
                                            }

                                        } else {
                                            ModalService.showModal({}, {
                                                headerText: 'Error',
                                                bodyText: response.message
                                            });
                                            $scope.isSendingRequest = false;
                                        }
                                    }).error(function (response) {
                                        ModalService.showModal({}, {
                                            headerText: 'Error',
                                            bodyText: response.message
                                        });
                                        $scope.isSendingRequest = false;
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

                        function containsObject(obj, list) {
                            for (var i = 0; i < list.length; i++) {
                                if (list[i] === obj) {
                                    return true;
                                }
                            }
                            return false;
                        }

                        function isObjectUndefine(obj) {
                            if (angular.isUndefined(obj)) {
                                return true;
                            } else {
                                return false;
                            }
                        }

                    }
                ],
            });
        }

        $scope.hasAddClassSessionPermission = function () {
            return AuthService.isAuthorized([
                USER_ROLES.ADMIN,
                USER_ROLES.TTC_USER,
                USER_ROLES.TTC_MANAGER,
                USER_ROLES.TTC_CORDINATOR
            ]);
        }

        $scope.cancel = function (Session) {

            var modalInstance = $modal.open({
                size: 'lg',
                animation: true,
                backdrop: 'static',
                templateUrl: 'SendMailCancelSession.html',
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

                        $http.post("ClassSession/GetParticipant", {
                            classId: classId,

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



                        var session = getClassSession(Session.Id);

                        $scope.mail.content =
                                "<p>Dear All, </p>"
                                + "<p>The session of "
                                + "<a href='http:/" + window.location.host + "/#/viewcourse/" + session.CourseId + "' size='3' color='#F0B51B'>" + session.CourseName + "</a>"
                                + " scheduled on "
                                + "<font size='3' color='red'>" + moment(session.StartTime).format("MMM DD, YYYY") + "</font>"
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
                            var cc = $scope.mail.cc.split(';');
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

                        $scope.ok = function (sendMailCancelSessionForm) {
                            if (sendMailCancelSessionForm.$valid && $scope.isMailFormatValid) {
                                var modalOptions = {
                                    closeButtonText: 'Cancel',
                                    actionButtonText: 'OK',
                                    headerText: 'Cancel Class Session',
                                    bodyText: 'Are you sure you want to cancel this session?'
                                };

                                ModalService.showModal({}, modalOptions).then(function (result) {

                                    var mail = {
                                        addressMailTo: getToMail(),
                                        addressMailCc: getCcMail(),
                                        cancelReason: $scope.mail.content
                                    }

                                    $http.post("ClassSession/CancelClassSession", {
                                        sessionId: Session.Id,
                                        mail: mail
                                    }).success(function (response) {
                                        if (response.success) {
                                            ModalService.showModal({}, {
                                                headerText: 'Success',
                                                bodyText: response.message
                                            });
                                            $modalInstance.dismiss();
                                            getClassSessions();
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
                            };
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

        $scope.openCancelReason = function (session) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'templateCancelReason.html',
                controller: [
                    '$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.cancelReason = session.CancelReason.replace("http:/" + window.location.host, "");
                        $scope.close = function () {
                            $modalInstance.dismiss();
                        };
                    }]
            })
        }

        $scope.checkSessionIsDone = function (endTime) {
            var currentDate = Date.now();
            if (endTime != null) {
                if (endTime < currentDate) {
                    var checkSessionIsDone = true;
                }
                else
                    checkSessionIsDone = false;
            }
            return checkSessionIsDone;
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

        function isClassDone(sessions) {
            var now = Date.now();
            for (var i = 0; i < sessions.length; i++) {
                if (sessions[i].EndTime != null) {
                    if (sessions[i].EndTime < now) {
                        $scope.isClassDone = true;
                    }
                    else {
                        $scope.isClassDone = false;
                        return;
                    }
                }
                else {
                    $scope.isClassDone = false;
                }
            }
        }

        $scope.exportParticipantsOfSession = function (sessionId) {
            var urlAction = "ClassParticipant/ExportParticipantsOfSession?sessionId=" + sessionId;
            window.location.assign(urlAction);
        }

        // getStandardDateTime to convert Trainning format date to standard format date
        var getStandardDateTime = function (strDate) {
            if (strDate.toString().search('-') && strDate.toString().length == 20) {
                var strDateTime = strDate.toString();
                return [strDateTime.slice(0, 12), strDateTime.slice(15) + ':00'].join(' ');
            }
            else {
                return strDate;
            }
        };
    }]);
