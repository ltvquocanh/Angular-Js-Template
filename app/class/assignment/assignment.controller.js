'use strict';
angular.module('mainApp').controller('Assignment',
    ['$scope', '$http', 'cfpLoadingBar', '$stateParams', 'ModalService', 'AuthService', 'Upload', 'USER_ROLES',
        function ($scope, $http, cfpLoadingBar, $stateParams, ModalService, AuthService, Upload, USER_ROLES) {

            var vm = this;

            init();

            function init() {
                $scope.assignment = {};
                $scope.isShowAssignment = false;
                $scope.isShowDescription = true;
                $scope.assignmentId = $stateParams.id;

                getAssignmentOfTrainee($scope.assignmentId);
            }

            function getAssignmentOfTrainee(assignmentId) {
                $http.get("Assignment/GetAssignmentOfTrainee", {
                    params: { assignmentId: assignmentId }
                }).success(function (response) {
                    $scope.assignment = response.data;

                    if ($scope.assignment.AttachmentId != null) {
                        $scope.isShowAttachment = true;
                    }

                    if ($scope.assignment.AssignmentAnswer != null
                        && $scope.assignment.AssignmentAnswer.AttachmentId != null) {
                        $scope.isShowAnswerAttachment = true;
                    }

                    $scope.isShowAssignment = true;
                }).error(function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                    window.history.back();
                });
            }

            $scope.save = function (answerForm) {
                if (answerForm.$valid) {
                    var modalOptions = {
                        closeButtonText: 'Cancel',
                        actionButtonText: 'OK',
                        headerText: 'Submit Answer',
                        bodyText: 'You can only answer this assignment once. Are you sure you want to submit this answer?'
                    };

                    ModalService.showModal({}, modalOptions).then(function (result) {
                        var diskFileName = "";

                        if ($scope.assignment.uploadedFile != null) {
                            Upload.upload({
                                url: 'Assignment/UploadAssignmentAnswerAttachment',
                                data: {
                                    assignmentId: $scope.assignment.Id,
                                    assignmentAnswerFile: $scope.assignment.uploadedFile
                                }
                            }).then(function (response) {
                                diskFileName = response.data.data;
                                addAssignmentAnswer(diskFileName);
                            }, function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.data.message
                                });
                            });
                        } else {
                            addAssignmentAnswer(diskFileName);
                        }

                        function addAssignmentAnswer(diskFileName) {
                            var assignmentAnswer = {
                                AssignmentId: $scope.assignmentId,
                                AnswerText: $scope.assignment.AnswerText,
                            }

                            $http.post("Assignment/AddAssignmentAnswer", {
                                assignmentAnswer: assignmentAnswer,
                                diskFileName: diskFileName
                            }).success(function (response) {
                                init();
                                ModalService.showModal({}, {
                                    headerText: 'Assignment Answer',
                                    bodyText: response.message
                                });
                            }).error(function (response) {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.message
                                });
                            });
                        }
                    });
                }
            }
        }]);
