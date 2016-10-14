'use strict';
angular.module('mainApp').controller('ViewSureyTemplate',
    ['$scope', '$http', '$window', 'cfpLoadingBar', '$stateParams', 'ModalService', 'AuthService', 'USER_ROLES',
        function ($scope, $http, $window, cfpLoadingBar, $stateParams, ModalService, AuthService, USER_ROLES) {

            var vm = this;

            init();

            function init() {
                $scope.survey = {};
                $scope.page = {};
                $scope.surveyId = $stateParams.id;
                $scope.surveyExist = false;
                $scope.isBack = false;
                $scope.isContinue = false;
                $scope.isSubmitted = false;
                $scope.thankYouExist = false;
                $scope.currentPage = 1;
                $scope.answerOptions = [];
                $scope.answerTexts = [];
                $scope.scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

                getSurvey($scope.surveyId);

                $scope.messageError = "Comment is required if you give score less than or equal ";
            }

            function getSurvey(surveyId) {
                $http.get("AddSurvey/GetSurveyForPreviewSurveyTemplate", {
                    params: { surveyId: surveyId }
                }).success(function (response) {
                    $scope.surveyExist = true;
                    $scope.survey = response.data;
                    showPage($scope.currentPage);
                }).error(function (response) {
                    var modalOptions = {
                        actionButtonText: 'OK',
                        headerText: 'Error',
                        bodyText: response.message
                    };

                    ModalService.showModal({}, modalOptions).then(function (result) {
                        $window.history.back();
                    });
                });
            }

            function showPage(currentPage) {
                if ($scope.survey.Pages != null) {
                    $scope.page = $scope.survey.Pages[currentPage - 1];
                    $scope.page.Title = $scope.survey.Title;

                    if ($scope.survey.TotalPage == 1) {
                        $scope.isBack = false;
                        $scope.isContinue = false;
                        $scope.isSubmitted = true;
                        $scope.page.Description = $scope.survey.Description;
                        $scope.page.ThankYou = $scope.survey.ThankYou;

                        if ($scope.page.ThankYou != "" && $scope.page.ThankYou != null) {
                            $scope.thankYouExist = true;
                        }
                    } else {
                        if (currentPage == 1) {
                            $scope.isBack = false;
                            $scope.isContinue = true;
                            $scope.isSubmitted = false;
                            $scope.page.Description = $scope.survey.Description;
                        } else if (currentPage == $scope.survey.TotalPage) {
                            $scope.isBack = true;
                            $scope.isContinue = false;
                            $scope.isSubmitted = true;
                            $scope.page.ThankYou = $scope.survey.ThankYou;

                            if ($scope.page.ThankYou != "" && $scope.page.ThankYou != null) {
                                $scope.thankYouExist = true;
                            }
                        } else {
                            $scope.isBack = true;
                            $scope.isContinue = true;
                            $scope.isSubmitted = false;
                        }
                    }
                }
            }

            $scope.chooseAnswerRadio = function (option) {
                option.IsChosen = true;

                angular.forEach($scope.page.Questions, function (question, index) {
                    if (question.Id == option.QuestionId) {
                        if (question.OptionParticipants == null) {
                            question.OptionParticipants.push(option);
                        } else {
                            question.OptionParticipants[0] = option;
                        }
                    }
                });
            }

            $scope.chooseAnswerdropdown = function (question, optionId) {
                angular.forEach(question.Options, function (option, index) {
                    if (option.Id == optionId) {
                        option.IsChosen = true;
                        if (question.OptionParticipants == null) {
                            question.OptionParticipants.push(option);
                        } else {
                            question.OptionParticipants[0] = option;
                        }
                    }
                });
            }

            $scope.chooseAnswerCheck = function (option) {
                angular.forEach($scope.page.Questions, function (question, index) {
                    if (question.Id == option.QuestionId) {
                        if (question.OptionParticipants == null) {
                            question.OptionParticipants.push(option);
                        } else {
                            var position = -1;
                            angular.forEach(question.OptionParticipants, function (optionParticipant, index) {
                                if (optionParticipant.Id == option.Id) {
                                    position = index;
                                }
                            });

                            if (position == -1) {
                                if (option.IsChosen == true) {
                                    question.OptionParticipants.push(option);
                                }
                            } else {
                                if (option.IsChosen == false) {
                                    question.OptionParticipants.splice(position, 1);
                                }
                            }
                        }
                    }
                });
            }

            $scope.someSelected = function (object) {
                return Object.keys(object).some(function (key) {
                    return object[key].IsChosen;
                });
            }

            $scope.submit = function (previewSurveyFrom) {
                $scope.isClicked = true;
                if ($scope.survey.IsParticipant) {
                    if (previewSurveyFrom.$valid) {
                        var modalOptions = {
                            closeButtonText: 'Cancel',
                            actionButtonText: 'OK',
                            headerText: 'Submit Feedback',
                            bodyText: 'Are you sure you want to submit this feedback?'
                        };

                        ModalService.showModal({}, modalOptions).then(function (result) {
                            $scope.addFeedback(true, 3);
                            $scope.isClicked = false;
                        });
                    }
                }
            }

            $scope.back = function (previewSurveyFrom) {
                $scope.currentPage--;
                showPage($scope.currentPage);
                $scope.isClicked = false;
                $scope.answerOptions = [];
                $scope.answerTexts = [];
            }

            $scope.continue = function (previewSurveyFrom) {
                $scope.isClicked = true;
                if (previewSurveyFrom.$valid && $scope.survey.IsParticipant) {
                    $scope.addFeedback(false, 2);
                    $scope.isClicked = false;
                } else if (previewSurveyFrom.$valid) {
                    $scope.currentPage++;
                    showPage($scope.currentPage);
                    $scope.isClicked = false;
                }

            }

            $scope.addFeedback = function (isSubmitted, typeAction) {
                $http.post("Survey/AddFeedback", {
                    pageId: $scope.page.Id,
                    isSubmitted: isSubmitted,
                    questionDtos: $scope.page.Questions,
                }).success(function (response) {
                    if (isSubmitted) {
                        var modalOptions = {
                            actionButtonText: 'OK',
                            headerText: 'Feedback',
                            bodyText: response.message
                        };

                        ModalService.showModal({}, modalOptions).then(function (result) {
                            $window.history.back();
                        });
                    }

                    if (typeAction == 1) {
                        $scope.currentPage--;
                        showPage($scope.currentPage);
                        $scope.answerOptions = [];
                        $scope.answerTexts = [];
                    } else if (typeAction == 2) {
                        $scope.currentPage++;
                        showPage($scope.currentPage);
                        $scope.answerOptions = [];
                        $scope.answerTexts = [];
                    }
                }).error(function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                });
            }

            $scope.getQuestionCode = function (indexQuestion, indexPage) {
                var questionCode = indexQuestion;
                for (var i = 0; i < indexPage; i++) {
                    questionCode = questionCode + $scope.survey.Pages[i].Questions.length;
                }
                return questionCode;
            }

            $scope.onChooseScoreName = function (commnentName) {
                document.getElementById(commnentName).focus();
            }
        }]);
