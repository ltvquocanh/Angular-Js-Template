'use strict';
angular.module('mainApp').controller('UpcomingCourses',
    ['$scope', '$http', 'cfpLoadingBar', '$state', '$stateParams', 'ModalService', 'moment', '$modal',
        'AuthService', 'USER_ROLES', 'DTOptionsBuilder', 'DTColumnDefBuilder', '$window',
        function ($scope, $http, cfpLoadingBar, $state, $stateParams, ModalService, moment, $modal,
            AuthService, USER_ROLES, DTOptionsBuilder, DTColumnDefBuilder, $window) {

            $scope.populateWidthOfCouse = function () {
                var widthOfRow = $(".wrap-course-upcoming-list").width();
                var widthOfItem = $(".course-upcoming").outerWidth(true);
                var numberItemOfRow = Math.ceil(widthOfRow / widthOfItem);
                $(".course-upcoming").width(widthOfRow / numberItemOfRow - 22);
            }

            init();
            function init() {
                $scope.isDisplay = false;
                $http.get("UpComingCourses/GetUpComingCourses")
                    .success(function (response) {
                        if (response.success == true) {
                            $scope.upcomingDomains = response.data.upcomingDomains;
                            $scope.isVisible = response.data.isVisible;

                            if ($scope.isVisible == true) {
                                $("#statusOn").addClass("btn-info");
                                $("#statusOff").addClass("btn-default");
                            } else {
                                $("#statusOn").addClass("btn-default");
                                $("#statusOff").addClass("btn-info");
                            }

                            angular.forEach($scope.upcomingDomains, function (upcomingDomain, key) {
                                angular.forEach(upcomingDomain.UpcomingCoursesDto, function (course, key) {
                                    course.Classes.sort(function (a, b) {
                                        return moment(a.StartTime).unix() - moment(b.StartTime).unix();
                                    });

                                    angular.forEach(course.Classes, function (aClass, key) {
                                        aClass.ClassSessions.sort(function (a, b) {
                                            return moment(a.StartTime).unix() - moment(b.StartTime).unix();
                                        });

                                        aClass.StartTimeFormat = moment(aClass.StartTime).format("MMM DD, YYYY");
                                        aClass.EndTimeFormat = moment(aClass.EndTime).format("MMM DD, YYYY");
                                        aClass.RegistrationDueTimeFormat = moment(aClass.RegistrationDueTime).format("MMM DD, YYYY");

                                        aClass.Methodology = aClass.Methodology.replace(/\n/g, "<br />");
                                        angular.forEach(aClass.ClassTrainers, function (classTrainer, key) {
                                            classTrainer.Introduction = classTrainer.Introduction.replace(/\n/g, "<br />");
                                            if (classTrainer.Trainer.IsExternal == true) {
                                                if (classTrainer.Avatar != null) {
                                                    classTrainer.Avatar = "Uploads/ExternalUserImages/" + classTrainer.Avatar;
                                                } else {
                                                    classTrainer.Avatar = "Uploads/CourseImages/DefaultTrainerAvatar.jpg";
                                                }
                                            }
                                            //get all trainer, not implement yet
                                        });
                                    });
                                    course.ClassessSessions = getTimeAndVenue(angular.copy(course.Classes));
                                });

                            });
                            $scope.populateWidthOfCouse();
                            $scope.isDisplay = true;
                        } else {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                                bodyText: response.message
                            });
                        }
                    }).error(function (response) {
                        if (response.message) {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                                bodyText: response.message
                            });
                        }
                    });
            }
            $scope.showingCourses = [];
            $scope.showDetail = function (course, courses, index) {
                $("#detail-html-course-id-full").remove();
                if (course.isShow) {
                    course.isShow = false;
                    $scope.showingCourses.splice(0, 1);
                    return;
                }
                else {
                    course.isShow = true;
                    if ($scope.showingCourses.length == 1) {
                        $scope.showingCourses[0].isShow = false;
                        $scope.showingCourses.splice(0, 1);
                    }
                    $scope.showingCourses.push(course);

                    // Define last Item of row based on  the cousre is clicked 
                    // inser template detail of course 
                    var widthOfRow = $(".wrap-course-upcoming-list").width();
                    var widthOfItem = $(".course-upcoming").width();
                    var numberItemOfRow = Math.floor(widthOfRow / widthOfItem);

                    var lastIndexRow = Math.ceil((index + 1) / numberItemOfRow) * numberItemOfRow - 1;
                    if (lastIndexRow < 1) {
                        lastIndexRow = 0;
                    }
                    if (lastIndexRow > courses.length - 1) {
                        lastIndexRow = courses.length - 1;
                    }
                    var idLastRow = courses[lastIndexRow].Id;
                    var detailHtmlCourse = $("#detail-html-course-id-" + course.Id).clone();
                    detailHtmlCourse.removeClass('ng-hide');
                    detailHtmlCourse.find("a").removeAttr("href");
                    $("#courseId" + idLastRow).after(detailHtmlCourse.attr("id", "detail-html-course-id-full"));
                    //
                    var marginLeft = 0;
                    if ((index + 1) % numberItemOfRow == 0) {
                        marginLeft = numberItemOfRow * widthOfItem - (widthOfItem / 2);
                    }
                    else {
                        marginLeft = (((index + 1) % numberItemOfRow) * widthOfItem) - (widthOfItem / 2);
                    }

                    $("#detail-html-course-id-full .arrow-up").css("margin-left", marginLeft);
                    $("#detail-html-course-id-full .right.carousel-control").click(function () {
                        var nextTrainer = $("#detail-html-course-id-full .carousel .item.text-center.active").next();
                        if (nextTrainer.length == 0) {
                            nextTrainer = $("#detail-html-course-id-full .carousel .item.text-center").first();
                        }
                        $("#detail-html-course-id-full .carousel .item.text-center.active").removeClass("active");
                        nextTrainer.addClass("active");
                    });
                    $("#detail-html-course-id-full .left.carousel-control").click(function () {

                        var prevTrainer = $("#detail-html-course-id-full .carousel .item.text-center.active").prev();
                        if (prevTrainer.length == 0) {
                            prevTrainer = $("#detail-html-course-id-full .carousel .item.text-center").last();
                        }
                        $("#detail-html-course-id-full .carousel .item.text-center.active").removeClass("active");
                        prevTrainer.addClass("active");
                    });
                }
            }

            $scope.setBackground = function (imagePath) {
                return { 'background-image': "url(Uploads/CourseImages/" + imagePath + ")" }
            }

            $scope.getMonthUpcoming = function () {
                var date = new Date();
                return date;
            }

            function getTimeAndVenue(classes) {
                var sessions = [];
                angular.forEach(classes, function (aClass, key) {
                    if (classes.length > 1) {
                        var session = { 'className': aClass.Name };
                        sessions.push(angular.copy(session));
                    }
                    var i = 1;
                    angular.forEach(aClass.ClassSessions, function (session, key) {
                        if (session.StartTime && session.EndTime) {
                            session.SessionNumber = i;
                            sessions.push(angular.copy(session));
                            i++;
                        }


                    });
                });
                return sessions;
            }


            $scope.getPrefix = function (number) {
                number = number + 26;
                if (number >= 26 && number <= 51) // A-Z
                    number = number + (65 - 26);
                else
                    return false; // range error
                return String.fromCharCode(number);

            }

            $scope.getNameFirstLast = function (fullName) {
                var fullNameArray = fullName.trim().split(" ");
                return fullNameArray[fullNameArray.length - 1] + " " + fullNameArray[0];
            }

            $scope.viewCourse = function (id) {
                $state.go("viewcourse", { id: id });
            }

            $scope.changeVisibilityStatus = function (isVisible) {
                $http.post("UpComingCourses/ChangeVisibleStatusUpcomingCourse", {
                    isVisible: isVisible
                }).success(function (response) {
                }).error(function (response) {
                    ModalService.showModal({}, {
                        headerText: 'Error',
                        bodyText: response.message
                    });
                });

                if (isVisible) {
                    $("#statusOn").removeClass("btn-default");
                    $("#statusOn").addClass("btn-info");

                    $("#statusOff").removeClass("btn-info");
                    $("#statusOff").addClass("btn-default");
                } else {
                    $("#statusOn").removeClass("btn-info");
                    $("#statusOn").addClass("btn-default");

                    $("#statusOff").removeClass("btn-default");
                    $("#statusOff").addClass("btn-info");
                }
            }

            $scope.hasChangeStatusPermission = function () {
                return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                                                USER_ROLES.TTC_MANAGER, USER_ROLES.TTC_CORDINATOR]);
            }
        }]);
