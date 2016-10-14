'use strict';
angular.module('mainApp').controller('SurveyReport',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', '$modal', '$filter', 'ModalService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SETTINGS',
        function ($scope, $http, cfpLoadingBar, $state, $stateParams, $modal, $filter, ModalService, DTOptionsBuilder, DTColumnDefBuilder, SETTINGS) {

            var vm = this;
            var surveyId = $stateParams.surveyId;
            init();

            function init() {
                $scope.textAnswerIndex = 0;
                $scope.$parent.route = $state.current.name;

                $scope.isShowCircleReport = false;
                $scope.dateFormat = SETTINGS.DATEFORMAT;

                $scope.dtOptions = DTOptionsBuilder.newOptions()
                  .withOption('bFilter', false)
                  .withOption('bInfo', false)
                  .withOption('bPaginate', false)
                  .withOption('bLengthChange', false)
                  .withOption('columnDefs', [{ "sortable": false, "targets": [0] }])


                $scope.dtColumnDefs = [
                    DTColumnDefBuilder.newColumnDef(0).notSortable(),
                ];

                $scope.dtInstanceCallback = function (dtInstance) {
                    dtInstance.DataTable.on('order.dt', function () {
                        dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                            cell.innerHTML = i + 1;
                        });
                    });
                }
                getInfotmationOfFeedback();
                $scope.showSumarryOptions = [];
            }

            $scope.showMoreContent = function (textAnswer, textAnswerId) {
                var textAnswerOption = $scope.showTextAnswerOption(textAnswerId);

                if (!textAnswerOption.isFullDetails) {
                    textAnswerOption.limit = textAnswer.length;
                    textAnswerOption.title = "Hide";
                    textAnswerOption.isFullDetails = true;
                    return;
                } else {
                    textAnswerOption.limit = 300;
                    textAnswerOption.title = "Full answer";
                    textAnswerOption.isFullDetails = false;
                }

            };

            $scope.showTextAnswerOption = function (textAnswerId) {
                for (var i = 0; i < $scope.showSumarryOptions.length; i++) {
                    if ($scope.showSumarryOptions[i].textAnswerId == textAnswerId) {
                        return $scope.showSumarryOptions[i];
                    }
                }
            }

            function getQuestionSurveyReport() {
                $http.get("Report/GetQuestions", {
                    params: {
                        surveyId: surveyId,
                    },
                }).success(function (response) {
                    if (response.success) {
                        $scope.questions = response.questionsData;
                        setSumarryOptions($scope.questions);
                        hasQuestion($scope.questions);
                        $scope.reportChart = response.reportChart;
                        for (var i = 0; i < $scope.questions.length; i++) {
                            if ($scope.questions[i].Type == 5 && $scope.questions[i].IsOverall) {
                                countScore($scope.questions[i]);
                                $scope.countAverage = $scope.countAverageScore($scope.questions[i]);
                                $scope.countFair = $scope.countFairScore($scope.questions[i]);
                                $scope.countGood = $scope.countGoodScore($scope.questions[i]);
                                $scope.countExcellent = $scope.countExcellentScore($scope.questions[i]);
                                $scope.total = $scope.countAverage + $scope.countFair + $scope.countGood + $scope.countExcellent;
                            }
                        }

                        $scope.barChartData = {
                            labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", ],
                            datasets: [
                                {
                                    fillColor: "rgba(20,157,202,1)",
                                    strokeColor: "rgba(20,157,202,1)",
                                    highlightFill: "rgba(20,157,202,1)",
                                    highlightStroke: "rgba(20,157,202,1)",
                                    data: [$scope.countScoreOne,
                                        $scope.countScoreTwo,
                                        $scope.countScoreThree,
                                        $scope.countScoreFour,
                                        $scope.countScoreFive,
                                        $scope.countScoreSix,
                                        $scope.countScoreSeven,
                                        $scope.countScoreEight,
                                        $scope.countScoreNine,
                                        $scope.countScoreTen,
                                    ],
                                }
                            ]
                        }
                        var options =
                        {
                            showTooltips: false,
                            showInlineValues: true,
                            centeredInllineValues: true,
                            tooltipCaretSize: 0,
                            tooltipTemplate: "<%= value %>",
                            scaleShowLabels: false,
                        }
                        var ctx = document.getElementById("chart-area").getContext("2d");
                        $scope.myLineChart = new Chart(ctx).Bar($scope.barChartData, options);
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

            function getInfotmationOfFeedback() {
                $http.get("Report/GetInformationOfFeedback", {
                    params: {
                        surveyId: surveyId,
                    },
                }).success(function (response) {
                    if (response.success) {
                        $scope.trainers = response.data.trainersOfSurvey;
                        $scope.registrations = response.data.registrationsOfSurvey.length;
                        $scope.participants = response.data.participantsOfSurvey.length;
                        $scope.userSurveys = response.data.userSurveysOfSurvey.length;
                        getQuestionSurveyReport();
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

            $scope.getTotalForOptionAnswer = function (question) {
                var total = 0;
                for (var i = 0; i < question.Options.length; i++) {
                    total += question.Options[i].CountAnswer;
                }
                return total;
            }

            $scope.getPercent = function (countAnswer, total) {
                var percent = countAnswer / total * 100;
                return percent.toFixed(2);
            }

            function setSumarryOptions(questions) {
                for (var i = 0; i < questions.length; i++) {
                    if (questions[i].Type == 4) {
                        for (var j = 0; j < questions[i].TextAnswers.length; j++) {
                            $scope.showSumarryOptions.push({
                                textAnswerId: questions[i].TextAnswers[j].Id,
                                isFullDetails: false,
                                title: "Full answer",
                                limit: 300
                            });
                        }
                    }
                }
            }

            function hasQuestion(questions) {
                if (questions.length != 0) {
                    $scope.isShowCircleReport = true
                    $scope.hasQuestion = true;
                } else {
                    $scope.hasQuestion = false;
                }
            }

            $scope.countLessThanCommentScoreLevel = function (question) {
                var countLessThanCommentScoreLevel = 0;
                for (var i = 0; i < question.TextAnswers.length; i++) {
                    if (question.TextAnswers[i].Score <= question.CommentScoreLevel) {
                        countLessThanCommentScoreLevel++;
                    }
                }
                return countLessThanCommentScoreLevel
            }

            $scope.countGreaterThanCommentScoreLevel = function (question) {
                var countGreaterThanCommentScoreLevel = 0;
                for (var i = 0; i < question.TextAnswers.length; i++) {
                    if (question.TextAnswers[i].Score > question.CommentScoreLevel) {
                        countGreaterThanCommentScoreLevel++;
                    }
                }
                return countGreaterThanCommentScoreLevel;
            }

            $scope.countAverageScore = function (question) {
                var countAverageScore = 0;
                for (var i = 0; i < question.TextAnswers.length; i++) {
                    if (question.TextAnswers[i].Score < 7) {
                        countAverageScore++;
                    }
                }
                return countAverageScore;
            }

            $scope.countFairScore = function (question) {
                var countFairScore = 0;
                for (var i = 0; i < question.TextAnswers.length; i++) {
                    if (question.TextAnswers[i].Score >= 7 && question.TextAnswers[i].Score < 8) {
                        countFairScore++;
                    }
                }
                return countFairScore;
            }

            $scope.countGoodScore = function (question) {
                var countGoodScore = 0;
                for (var i = 0; i < question.TextAnswers.length; i++) {
                    if (question.TextAnswers[i].Score >= 8 && question.TextAnswers[i].Score < 9) {
                        countGoodScore++;
                    }
                }
                return countGoodScore;
            }

            $scope.countExcellentScore = function (question) {
                var countExcellentScore = 0;
                for (var i = 0; i < question.TextAnswers.length; i++) {
                    if (question.TextAnswers[i].Score >= 9) {
                        countExcellentScore++;
                    }
                }
                return countExcellentScore;
            }

            function countScore(question) {
                $scope.countScoreOne = 0; $scope.countScoreTwo = 0;
                $scope.countScoreThree = 0; $scope.countScoreFour = 0;
                $scope.countScoreFive = 0; $scope.countScoreSix = 0;
                $scope.countScoreSeven = 0; $scope.countScoreEight = 0;
                $scope.countScoreNine = 0; $scope.countScoreTen = 0;
                $scope.totalScore = 0

                for (var i = 0; i < question.TextAnswers.length; i++) {
                    switch (question.TextAnswers[i].Score) {
                        case 1:
                            $scope.countScoreOne++;
                            break;
                        case 2:
                            $scope.countScoreTwo++;
                            break;
                        case 3:
                            $scope.countScoreThree++;
                            break;
                        case 4:
                            $scope.countScoreFour++;
                            break;
                        case 5:
                            $scope.countScoreFive++;
                            break;
                        case 6:
                            $scope.countScoreSix++;
                            break;
                        case 7:
                            $scope.countScoreSeven++;
                            break;
                        case 8:
                            $scope.countScoreEight++;
                            break;
                        case 9:
                            $scope.countScoreNine++;
                            break;
                        case 10:
                            $scope.countScoreTen++;
                            break;
                    }
                    $scope.totalScore += question.TextAnswers[i].Score;
                }
                var totalSubmittedFeedback = question.TextAnswers.length;

                $scope.getPercentScoreOne = $scope.getPercent($scope.countScoreOne, totalSubmittedFeedback);
                $scope.getPercentScoreTwo = $scope.getPercent($scope.countScoreTwo, totalSubmittedFeedback);
                $scope.getPercentScoreThree = $scope.getPercent($scope.countScoreThree, totalSubmittedFeedback);
                $scope.getPercentScoreFour = $scope.getPercent($scope.countScoreFour, totalSubmittedFeedback);
                $scope.getPercentScoreFive = $scope.getPercent($scope.countScoreFive, totalSubmittedFeedback);
                $scope.getPercentScoreSix = $scope.getPercent($scope.countScoreSix, totalSubmittedFeedback);
                $scope.getPercentScoreSeven = $scope.getPercent($scope.countScoreSeven, totalSubmittedFeedback);
                $scope.getPercentScoreEight = $scope.getPercent($scope.countScoreEight, totalSubmittedFeedback);
                $scope.getPercentScoreNine = $scope.getPercent($scope.countScoreNine, totalSubmittedFeedback);
                $scope.getPercentScoreTen = $scope.getPercent($scope.countScoreTen, totalSubmittedFeedback);
                $scope.finalScore = ($scope.totalScore / totalSubmittedFeedback).toFixed(2);
                if ($scope.finalScore >= 9) {
                    $scope.ranking = "Excellent";
                } else if ($scope.finalScore >= 8 && $scope.finalScore < 9) {
                    $scope.ranking = "Good";
                } else if ($scope.finalScore >= 7 && $scope.finalScore < 8) {
                    $scope.ranking = "Fair";
                } else if ($scope.finalScore < 7) {
                    $scope.ranking = "Average";
                }
            }

            $scope.exportSurvey = function () {
                var urlAction = "Report/ExportSurvey?surveyId=" + surveyId;
                window.location.assign(urlAction);
            }
        }]);