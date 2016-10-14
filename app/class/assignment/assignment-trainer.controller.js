'use strict';
angular.module('mainApp').controller('AssignmentTrainer',
    ['$scope','$rootScope', '$http', 'ModalService', 'AuthService', 'USER_ROLES', '$stateParams', '$window',
function ($scope, $rootScope, $http, ModalService, AuthService, USER_ROLES, $stateParams, $window) {

    init();
    function init() {
        var assignmentId = parseInt($stateParams.assignmentId);
        getAssignment(assignmentId);
    }

    $scope.CanAccessAssignment = function () {
        return $rootScope.isTrainer;
    }

    $scope.showScoredAssignment = function () {
        $scope.isScored = true;
    };

    $scope.showWaitingAssignment = function () {
        $scope.isScored = false;
    }

    $scope.filerbyScore = function (assignmentAnswer) {
        return (assignmentAnswer.Score && $scope.isScored) || (!assignmentAnswer.Score && !$scope.isScored);
    }

    $scope.getColorByScore = function (score) {
        if (score === undefined || score == null || !score) {
            return ["color-score-no", "color-user-no"];
        }

        if (score >= 8) {
            return ["color-score-high", "color-user-high"];
        }

        if (score >= 5 & score <= 7) {
            return ["color-score-average", "color-user-average"];
        }

        if (score < 5) {
            return ["color-score-low", "color-user-low"];
        }
    }

    $scope.copy = function (assignmentAnswer) {
        return angular.copy(assignmentAnswer);
    };
    $scope.cancel = function (assignmentAnswer) {
        assignmentAnswer.isScoring = false;
        assignmentAnswer.cancel = true;
    }

    $scope.save = function (assignmentAnswer, assignmentAnswerEditing) {
        if (!assignmentAnswerEditing.Score && !assignmentAnswerEditing.ScoreComment) {
            return;
        }
        $http.post("AssignmentTrainer/UpdateScoreComment", {
            id: assignmentAnswerEditing.Id,
            score: assignmentAnswerEditing.Score,
            comment: assignmentAnswerEditing.ScoreComment,
            assignmentName: $scope.assignment.Name,
            participantName: assignmentAnswer.Participant.FullName,
            participantUseName: assignmentAnswer.Participant.Username,
        }).success(function (response) {
            if (!$scope.isScored && assignmentAnswerEditing.Score) {
                $scope.assignment.NumberOfScore = $scope.assignment.NumberOfScore + 1;
                $scope.assignment.NumberOfWaiting = $scope.assignment.NumberOfWaiting - 1;
            }

            assignmentAnswer.Score = assignmentAnswerEditing.Score;
            assignmentAnswer.ScoreComment = assignmentAnswerEditing.ScoreComment
            assignmentAnswer.isScoring = false;

        }).error(function (response) {
            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: response.message
            });
        });
    };

    $scope.downloadAssignmentAttachment = function (assignmentId, attachmentId) {
        $window.location.href = "AssignmentTrainer/DownloadAssignmentAttachment?assignmentId=" + assignmentId + "&attachmentId=" + attachmentId;;
    }

    $scope.downloadAssignmentAnswerAttachment = function (assignmentAnswerId, attachmentId) {
        $window.location.href = "AssignmentTrainer/DownloadAssignmentAnswerAttachment?assignmentAnswerId=" + assignmentAnswerId + "&attachmentId=" + attachmentId;
    }
    $scope.showFirstAssignmentAnswer = function (index, assignmentAnswer) {
        if (index == 0 && !$scope.isScored && !assignmentAnswer.isScoring && !assignmentAnswer.Score) {
            assignmentAnswer.isScoring = true;
        }
    }

    function getAssignment(assignmentId) {
        $http.get("AssignmentTrainer/GetTrainerAssignment", {
            params: { assignmentId: assignmentId }
        }).success(function (response) {
            if (response.success) {
                $scope.assignment = response.data;
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
}]);
