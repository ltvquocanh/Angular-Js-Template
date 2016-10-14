'use strict';

angular.module('mainApp').config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES',
    function ($stateProvider, $urlRouterProvider, USER_ROLES) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'Frontend/app/authentication/login.html',
                controller: 'Login',
                data: {
                    authorizedRoles: [USER_ROLES.ANONYMOUS]
                }
            })
            .state('upcomingcourse', {
                url: '/upcomingcourse',
                templateUrl: 'Frontend/app/course/view/upcoming-course.html',
                controller: "UpcomingCourses",
                data: {
                    authorizedRoles: []
                }
            })

            .state('course', {
                url: '/course/:id',
                abstract: true,
                controller: "Course",
                templateUrl: 'Frontend/app/course/edit/course.html',
            })
            .state('course.general', {
                url: '/general',
                templateUrl: 'Frontend/app/course/edit/course.general.html',
                controller: "CourseGeneral",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })
             .state('course.session', {
                 url: '/session',
                 templateUrl: 'Frontend/app/course/edit/course.session.html',
                 controller: "CourseSession",
                 data: {
                     authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                     ]
                 }
             })
            .state('course.resource', {
                url: '/resource',
                templateUrl: 'Frontend/app/course/edit/course.resource.html',
                controller: "CourseResource",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })
            .state('course.class', {
                url: '/class',
                templateUrl: 'Frontend/app/course/edit/course.class.html',
                controller: "CourseClass",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

            .state('addcourse', {
                url: '/addcourse/:id',
                templateUrl: 'Frontend/app/course/add/add-course.html',
                controller: 'AddCourse',
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

            .state('coursecatalog', {
                url: '/coursecatalog',
                templateUrl: 'Frontend/app/course/catalog/course-catalog.html',
                controller: 'CourseCatalog',
                data: {
                    authorizedRoles: []
                }
            })
            .state('viewcourse', {
                url: '/viewcourse/:id',
                templateUrl: 'Frontend/app/course/view/view-course.html',
                controller: 'ViewCourse',
                data: {
                    authorizedRoles: []
                }

            })
            .state('class', {
                url: '/class/:id',
                abstract: true,
                controller: "Class",
                templateUrl: 'Frontend/app/class/edit/class.html',
            })
            .state('class.participant', {
                url: '/participant',
                templateUrl: 'Frontend/app/class/edit/class.participant.html',
                controller: "ClassParticipant",
                data: {
                    authorizedRoles: [
                    ]
                }
            })
             .state('class.registration', {
                 url: '/registration',
                 templateUrl: 'Frontend/app/class/edit/class.registration.html',
                 controller: "ClassRegistration",
                 data: {
                     authorizedRoles: [
                     ]
                 }
             })
            .state('class.session', {
                url: '/session',
                templateUrl: 'Frontend/app/class/edit/class.session.html',
                controller: "ClassTimePlace",
                data: {
                    authorizedRoles: [
                    ]
                }
            })
            .state('class.trainermethod', {
                url: '/trainermethod',
                templateUrl: 'Frontend/app/class/edit/class.trainer-method.html',
                controller: "ClassTrainerMethod",
                data: {
                    authorizedRoles: [
                    ]
                }
            })
            .state('class.activity', {
                url: '/activity',
                templateUrl: 'Frontend/app/class/edit/class.activity.html',
                controller: "ClassActivity",
                data: {
                    authorizedRoles: [
                    ]
                }
            })
             .state('myteachingclasses', {
                 url: '/myteachingclasses',
                 templateUrl: 'Frontend/app/class/myclass/my-teaching-class.html',
                 controller: "MyTeachingClasses",
                 data: {
                     authorizedRoles: []
                 }
             })
             .state('recentregistration', {
                 url: '/recentregistration',
                 templateUrl: 'Frontend/app/class/registration/class.recent-registration.html',
                 controller: "RecentRegistration",
                 data: {
                     authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                     ]
                 }
             })
             .state('assignmenttrainer', {
                 url: '/assignmenttrainer/:assignmentId',
                 templateUrl: 'Frontend/app/class/assignment/assignment-trainer.html',
                 controller: "AssignmentTrainer",
                 data: {
                     authorizedRoles: [
                     ]
                 }
             })
            .state('coursecalendar', {
                url: '/coursecalendar',
                templateUrl: 'Frontend/app/course/view/course-calendar.html',
                controller: "CourseCalendar",
                data: {
                    authorizedRoles: []
                }
            })
            .state('myclasses', {
                url: '/myclasses',
                templateUrl: 'Frontend/app/class/myclass/my-class.html',
                controller: "MyClasses",
                data: {
                    authorizedRoles: []
                }
            })
            .state('assignment', {
                url: '/assignment/:id',
                templateUrl: 'Frontend/app/class/assignment/assignment.html',
                controller: "Assignment",
                data: {
                    authorizedRoles: []
                }
            })
        .state('viewsurvey', {
            url: '/viewsurvey/:id',
            templateUrl: 'Frontend/app/class/survey/view/view-survey.html',
            controller: "ViewSurey",
            data: {
                authorizedRoles: []
            }
        })
            //.state('upcoming', {
            //    url: '/upcoming',
            //    templateUrl: 'Frontend/app/course-management/upcoming.html',
            //    controller: 'Upcoming',
            //    data: {
            //    }
            //})
            //.state('mycourse', {
            //    url: '/mycourse',
            //    templateUrl: 'Frontend/app/course-management/my-course.html',
            //    controller: 'MyCourse',
            //    data: {
            //    }
            //})
            //.state('registration', {
            //    url: '/addcourses',
            //    templateUrl: 'Frontend/app/course-management/registration.html',
            //    controller: 'Registration',
            //    data: {
            //    }
            //});
            .state('course.addclass', {
                url: '/addclass',
                templateUrl: 'Frontend/app/class/add/add-class.html',
                controller: "AddClass",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })
            .state('memberregistrations', {
                url: '/memberregistrations',
                templateUrl: 'Frontend/app/registration/member-registrations.html',
                controller: "MemberRegistration",
                data: {
                    authorizedRoles: [
                        USER_ROLES.MANAGER
                    ]
                }
            })
            .state('class.editassignment', {
                url: '/editassignment/:assignmentId',
                templateUrl: 'Frontend/app/class/edit/class.edit-assignment.html',
                controller: "EditAssignment",
                data: {
                    authorizedRoles: []
                }
            })
        


            .state('class.addassignment', {
                url: '/addassignment',
                templateUrl: 'Frontend/app/class/add/add-assignment.html',
                controller: "AddAssignment",
                data: {
                    authorizedRoles: []
                }
            })

            .state('class.addsurvey', {
                url: '/addsurvey',
                templateUrl: 'Frontend/app/class/survey/add/add-survey.html',
                controller: "AddSurvey",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

            .state('survey', {
                url: '/survey/:surveyId',
                abstract: true,
                controller: "Survey",
                templateUrl: 'Frontend/app/class/survey/edit/survey.html',
            })

            .state('survey.question', {
                url: '/question',
                controller: "SurveyQuestion",
                templateUrl: 'Frontend/app/class/survey/edit/survey-question.html',
                data: {
                    authorizedRoles: [
                       USER_ROLES.ADMIN,
                       USER_ROLES.TTC_USER,
                       USER_ROLES.TTC_MANAGER,
                       USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

            .state('survey.reports', {
                url: '/reports',
                templateUrl: 'Frontend/app/class/survey/view/survey-report.html',
                controller: "SurveyReport",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

            .state('survey.general', {
                url: '/general',
                templateUrl: 'Frontend/app/class/survey/edit/edit-survey.html',
                controller: "EditSurvey",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

            .state('class.addsurveytemplate', {
                url: '/addsurveytemplate',
                templateUrl: 'Frontend/app/class/survey/add/template/add-survey-template.html',
                controller: "AddSurveyTemplate",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })
            .state('viewsurveytemplate', {
                url: '/viewsurveytemplate/:id',
                templateUrl: 'Frontend/app/class/survey/view/view-survey-template.html',
                controller: "ViewSureyTemplate",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

            .state('survey.editsurveytemplate', {
                url: '/editsurveytemplate',
                templateUrl: 'Frontend/app/class/survey/edit/template/edit-survey-template.html',
                controller: "EditSurveyTemplate",
                data: {
                    authorizedRoles: [
                        USER_ROLES.ADMIN,
                        USER_ROLES.TTC_USER,
                        USER_ROLES.TTC_MANAGER,
                        USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

            .state('externaluser', {
                url: '/externaluser',
                templateUrl: 'Frontend/app/externaluser/external-user.html',
                controller: "ExternalUser",
                data: {
                    authorizedRoles: [
                       USER_ROLES.ADMIN,
                       USER_ROLES.TTC_USER,
                       USER_ROLES.TTC_MANAGER,
                       USER_ROLES.TTC_CORDINATOR
                    ]
                }
            })

        $urlRouterProvider.otherwise('upcomingcourse');
    }]);
