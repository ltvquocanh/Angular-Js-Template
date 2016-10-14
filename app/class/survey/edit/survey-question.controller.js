'use strict';

angular.module('mainApp').controller('SurveyQuestion',
    ['$scope', '$http', 'ModalService', 'AuthService', 'USER_ROLES', '$stateParams', '$window', 'QUESTION_TYPE', 'moment', '$timeout',
function ($scope, $http, ModalService, AuthService, USER_ROLES, $stateParams, $window, QUESTION_TYPE, moment, $timeout) {

    var surveyId = parseInt($stateParams.surveyId);

    init();

    function init() {
        $scope.isSendingRequest = false;
        $scope.canEditSurvey = true;

        $scope.questionTypes = QUESTION_TYPE;

        $http.get("SurveyQuestion/GetSurvey", {
            params: { surveyId: surveyId }
        }).success(function (response) {
            if (response.success) {
                $scope.survey = response.data;
                if ($scope.survey.Pages.length == 0) {
                    $scope.addPage(0, 0);
                }
                if (!$scope.survey.IsTemplate && moment($scope.survey.StartTime).unix() < moment(Date.now()).unix()) {
                    $scope.canEditSurvey = false;
                    $scope.errorMessage = "Feedback started. You can only view it.";

                    $timeout(function () {
                        $scope.errorMessage = null;
                    }, 35000);
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

        });
    }

    $scope.preview = function (surveyId) {
        if ($scope.survey.IsTemplate) {
            var url = "#/viewsurveytemplate/" + surveyId;
        } else {
            var url = "#/viewsurvey/" + surveyId;
        }
        var win = $window.open(url, '_blank');
        win.focus();
    }

// Document of ng-sortable
//    Callbacks:

//        Following callbacks are defined, and should be overridden to perform custom logic.

//        callbacks.accept = function (sourceItemHandleScope, destSortableScope, destItemScope) {}; //used to determine drag zone is allowed are not.
//    Parameters:

//        sourceItemScope - the scope of the item being dragged.
//        destScope - the sortable destination scope, the list.
//        destItemScope - the destination item scope, this is an optional Param.(Must check for undefined).
//callbacks.orderChanged = function({type: Object}) // triggered when item order is changed with in the same column.
//callbacks.itemMoved = function({type: Object}) // triggered when an item is moved across columns.
//    callbacks.dragStart = function({type: Object}) // triggered on drag start.
//    callbacks.dragEnd = function({type: Object}) // triggered on drag end.
//    Parameters:

//        Object (event) - structure         
//    XXX source:
//    index: original index before move.
//        itemScope: original item scope before move.
//        sortableScope: original sortable list scope.

//     XXX   dest: index
//    index: index after move.
    //        sortableScope: destination sortable scope. 

    var dragQuestion ={};
    var dropQuestion ={};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    $scope.dragControlListeners = {
        //accept: function (sourceItemHandleScope, destSortableScope) {
        //},
        itemMoved: function (event) {
        },
        orderChanged: function (event) {
        },
        dragStart: function (event) {
            // triggered on drag start.
            dragQuestion = angular.copy(event.source.itemScope.question);
          
        }, 
        dragEnd: function (event) {
            angular.forEach($scope.survey.Pages, function (page, key) {
                var i = 1;
                angular.forEach(page.Questions, function (question, key) {
                    question.PageId = page.Id;
                    question.QuestionNumber = i;
                    i++;
                    if(question.Id == dragQuestion.Id){
                        dropQuestion = angular.copy(question);
                    }
                });
            });

            if (!(dragQuestion.PageId == dropQuestion.PageId && dragQuestion.QuestionNumber == dropQuestion.QuestionNumber)) {
                // move actually
                $scope.isSendingRequest = true;

                $http.post("SurveyQuestion/DragDropQuestion", {
                    dragQuestionDto: dropQuestion
                }).success(function (response) {
                    $scope.isSendingRequest = false;
                }).error(function (response) {
                    $scope.isSendingRequest = false;
                    init();
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });

                });
            }
        },
        //containment: '#board',//optional param.
        //clone: true, //optional param for clone feature.
        //allowDuplicates: false
    };

    $scope.omMouseEnterHeaderQuestion = function () {
        // enable drag drop
        $scope.enterDragDropArea = true;
    }

    $scope.onMouseLeaveHeaderQuestion = function () {
        // disable drag drop so you can type text on input tag on click on drop dow...
        // library  is preven it   by default .
        // dive into the code  
        //dragListen = function (event) {
        //event.preventDefault(); // line 684 in file ng-sortable.js
        $scope.enterDragDropArea = false;
    }

    $scope.isDisableMove = function () {
        $scope.isShowingForm = false;

        angular.forEach($scope.survey.Pages, function (pages, key) {
            angular.forEach(pages.Questions, function (question, key) {
                if (question.showFormCreateQuestion) {
                    $scope.isShowingForm = true;
                }

            });
        });

        return $scope.isSendingRequest || !$scope.canEditSurvey || $scope.isShowingForm ||!$scope.enterDragDropArea;;
        
    }

    $scope.checkTextOption = function (options) {
        var invalidOptions = [];
        var messageEmpty = "Option is not empty";
        var messageMaxLength = "Max length for each option is 250 characters";

        if (options) {
            var arrayOptions = options.split("\n");

            for (var i = 0; i < arrayOptions.length; i++) {
                if (invalidOptions.length == 2) {
                    break;
                }
                if (arrayOptions[i].length == 0) {
                    if (invalidOptions.indexOf(messageEmpty) == -1) {
                        invalidOptions.push(messageEmpty);
                    }
                }
                if (arrayOptions[i].length > 250) {
                    if (invalidOptions.indexOf(messageMaxLength) == -1) {
                        invalidOptions.push(messageMaxLength);
                    }
                }
            }
        }
        return invalidOptions;
    }

    var resetForm = function (question) {
        question.isAdding = false;
        question.isEditing = false;
        question.isCopying = false;
        question.showFormCreateQuestion = false;
    }

    $scope.onChangeOption = function (newQuestion) {
        if (!newQuestion.CommentScoreLevel) {
            newQuestion.CommentScoreLevel = 6;
        }
    }

    $scope.addPage = function (pageNumber, questionNumber) {
        $scope.isSendingRequest = true;
        $http.post("SurveyQuestion/AddPage", {
            surveyId: surveyId,
            pageNumber: pageNumber,
            questionNumber: questionNumber,

        }).success(function (response) {
            $scope.isSendingRequest = false;
            var pages = $scope.survey.Pages;
            var newPage = {
                Questions: [],
                PageNumber: pageNumber + 1,
                Id: response.data,
                SurveyId: $scope.survey.Id,
                IsDeleted: false,
            };

            if (pageNumber > 0) {
                newPage.Questions = pages[pageNumber - 1].Questions.splice(questionNumber);
                for (var i = 0; i < newPage.Questions.length; i++) {
                    newPage.Questions[i].QuestionNumber = i + 1;
                }
            }

            for (var i = pageNumber; i < pages.length; i++) {
                pages[i].PageNumber++;
            }

            pages.splice(pageNumber, 0, newPage);

        }).error(function (response) {
            $scope.isSendingRequest = false;

            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: response.message
            });

        });
    }

    $scope.showCreateForm = function (newQuestion, question, page) {
        newQuestion.Type = 1;
        if (question) {
            question.isCopying = false;
            question.isEditing = false;
            question.isAdding = true;
            question.showFormCreateQuestion = !question.showFormCreateQuestion;
            newQuestion.QuestionNumber = question.QuestionNumber + 1;
            newQuestion.PageId = question.PageId;
        }
        else {
            newQuestion.QuestionNumber = 1;
            newQuestion.PageId = page.Id;
            page.isShow = true;
        }

    }

    $scope.cancelForm = function (question, page) {
        if (question) {
            resetForm(question);
        }
    }

    function compare(a, b) {
        if (a.QuestionNumber < b.QuestionNumber)
            return -1;
        else if (a.QuestionNumber > b.QuestionNumber)
            return 1;
        else
            return 0;
    }

    $scope.moveQuestion = function (page, index, isUp) {
        var fromQuestion = page.Questions[index];
        $scope.isSendingRequest = true;
        $http.post("SurveyQuestion/MoveQuestion", {
            fromQuestionId: fromQuestion.Id,
            isUp: isUp
        }).success(function (response) {

            var indexCurrentPage = $scope.survey.Pages.indexOf(page);

            if (isUp) {//Move UP
                if (index == 0) {
                    var newPage = $scope.survey.Pages[indexCurrentPage - 1];
                    page.Questions[0].PageId = newPage.Id;
                    page.Questions[0].QuestionNumber = newPage.Questions.length + 1;
                    //add question
                    newPage.Questions.push(angular.copy(page.Questions[0]));

                    //delete question
                    page.Questions.splice(0, 1);
                    for (var i = 0; i < page.Questions.length; i++) {
                        page.Questions[i].QuestionNumber--;
                    }
                }
                else {
                    var toQuestion = page.Questions[index - 1];
                    fromQuestion.QuestionNumber--;
                    toQuestion.QuestionNumber++;
                }
            }
            else {// Move Down
                if (index == page.Questions.length - 1) {
                    var newPage = $scope.survey.Pages[indexCurrentPage + 1];
                    page.Questions[index].PageId = newPage.Id;
                    page.Questions[index].QuestionNumber = 1;
                    // add question to new page
                    for (var i = 0; i < newPage.Questions.length; i++) {
                        newPage.Questions[i].QuestionNumber++;
                    }
                    newPage.Questions.splice(0, 0, angular.copy(page.Questions[index]));
                    // delete question from old page
                    page.Questions.splice(index, 1);
                }
                else {
                    var toQuestion = page.Questions[index + 1];
                    fromQuestion.QuestionNumber++;
                    toQuestion.QuestionNumber--;
                }

            }

            page.Questions.sort(compare);
            $scope.isSendingRequest = false;

        }).error(function (response) {
            $scope.isSendingRequest = false;
            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: response.message
            });

        });
    }

    $scope.addQuestion = function (surveyQuestionForm, page, newQuestion, position, question) {
        if (!surveyQuestionForm.$valid || $scope.checkTextOption(newQuestion.Options).length > 0) {
            return;
        }

        $scope.isSendingRequest = true;
        var addingQuestion = angular.copy(newQuestion);
        addingQuestion.Options = [];

        if (newQuestion.Options) {
            var options = newQuestion.Options.split("\n");
            for (var i = 0; i < options.length; i++) {
                addingQuestion.Options.push({ Title: options[i] });
            }
        }

        $http.post("SurveyQuestion/AddQuestion", {
            questionDto: addingQuestion
        }).success(function (response) {
            page.isShow = false;
            if (question) {
                resetForm(question);
            }
            else {
                // page have no question
                position = 0;
                addingQuestion.QuestionNumber = 1;
            }
            var questions = page.Questions;

            for (var i = position; i < questions.length; i++) {
                questions[i].QuestionNumber = questions[i].QuestionNumber + 1;
            }

            addingQuestion.Id = response.data;
            questions.splice(position, 0, addingQuestion);
            $scope.isSendingRequest = false;
        }).error(function (response) {
            $scope.isSendingRequest = false;

            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: response.message
            });

        });

    }

    $scope.copy = function (question) {
        var copyQuestion = angular.copy(question);
        resetForm(copyQuestion);
        return copyQuestion;
    }

    function convertOption(newQuestion) {
        var option = "";

        angular.forEach(newQuestion.Options, function (value, key) {
            option = option + value.Title + "\n";
        });

        if (option && option.length > 0) {
            option.slice(option.length - 1);
        }

        newQuestion.Options = option.trim();
    }

    $scope.showEditForm = function (question, newQuestion) {
        question.showFormCreateQuestion = true;
        question.isEditing = true;
        convertOption(newQuestion);
    }

    $scope.showCopyForm = function (question, newQuestion) {
        question.isCopying = true;
        question.showFormCreateQuestion = true;

        newQuestion.Id = null;
        newQuestion.QuestionNumber = question.QuestionNumber + 1;

        convertOption(newQuestion);
    }

    $scope.editQuestion = function (surveyQuestionForm, newQuestion, question) {

        if (!surveyQuestionForm.$valid || $scope.checkTextOption(newQuestion.Options).length > 0) {
            return;
        }

        $scope.isSendingRequest = true;

        var editingQuestion = angular.copy(question);
        editingQuestion = angular.copy(newQuestion);
        editingQuestion.Options = [];

        if (newQuestion.Options && newQuestion.Type != 4 && newQuestion.Type != 5) {
            var options = newQuestion.Options.split("\n");

            for (var i = 0; i < options.length; i++) {
                editingQuestion.Options.push({ Title: options[i], QuestionId: question.Id });
            }
        }

        $http.post("SurveyQuestion/UpdateQuestion", {
            questionDto: editingQuestion
        }).success(function (response) {
            angular.copy(editingQuestion, question);
            resetForm(question);
            $scope.isSendingRequest = false;
        }).error(function (response) {
            $scope.isSendingRequest = false;

            ModalService.showModal({}, {
                headerText: 'Error',
                bodyText: response.message
            });

        });
    }

    $scope.deleteQuestion = function (questionId, currentPosition, questions) {

        var modalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'OK',
            headerText: 'Delete Question',
            bodyText: 'Are you sure you want to delete this question?'
        };

        ModalService.showModal({}, modalOptions).then(function (result) {
            $scope.isSendingRequest = true;

            $http.post("SurveyQuestion/DeleteQuestion", {
                questionId: questionId,
            }).success(function (response) {
                if (response.success) {
                    questions.splice(currentPosition - 1, 1);
                    for (var i = currentPosition - 1; i < questions.length; i++) {
                        questions[i].QuestionNumber = questions[i].QuestionNumber - 1;
                    }
                } else {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                }

                $scope.isSendingRequest = false;
            }).error(function (response) {
                $scope.isSendingRequest = false;

                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
            });
        });
    }

    $scope.deletePage = function (pageId, pageNumber) {

        var modalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'OK',
            headerText: 'Delete Page',
            bodyText: 'Are you sure you want to delete this page?'
        };

        ModalService.showModal({}, modalOptions).then(function (result) {
            $scope.isSendingRequest = true;

            $http.post("SurveyQuestion/DeletePage", {
                pageId: pageId,
            }).success(function (response) {
                if (response.success) {
                    var pages = $scope.survey.Pages;
                    pages.splice(pageNumber - 1, 1);

                    for (var i = pageNumber - 1; i < pages.length ; i++) {
                        pages[i].PageNumber--;
                    }

                } else {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                }

                $scope.isSendingRequest = false;
            }).error(function (response) {
                $scope.isSendingRequest = false;

                ModalService.showModal({}, {
                    headerText: 'Error',
                    bodyText: response.message
                });
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

}]);
