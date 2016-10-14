'use strict';
angular.module('mainApp').controller('CourseCatalog',
    ['$scope', '$http', '$rootScope', 'cfpLoadingBar', '$state', '$stateParams', '$modal',
        'AuthService', 'USER_ROLES', 'ModalService',
        function ($scope, $http, $rootScope, cfpLoadingBar, $state, $stateParams, $modal,
            AuthService, USER_ROLES, ModalService) {

            var vm = this;
            init();

            $scope.trainingMethod = {
                'Online': 1,
                'Classroom': 2
            }

            function init() {
                $scope.$parent.menuRoute = $state.current.name;
                $scope.parentNode = null;
                $scope.domainTree = [];
                $scope.expandedNodes = [];
                
                getDomains();
                $scope.treeOptions = {
                    nodeChildren: "Children",
                    dirSelectable: true,
                    allowDeselect: false,
                    multiSelection: false,
                }
            }

            function getDomainNames() {
                $http.get("CourseCatalog/GetDomainNames")
                    .success(function (response) {
                        if (response.success) {
                            $scope.domainNames = response.data;
                        }
                        else {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                            });
                        }
                    }).error(function (response) {
                        if (response.message) {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                            });
                        }
                    });
            }

            function getDomains() {
                getDomainNames();
                $http.get("CourseCatalog/GetDomainTree")
                    .success(function (response) {
                        if (response.success) {
                            $scope.treeData = response.data;
                            if ($scope.treeData.length > 0) {
                                if ($rootScope.selectedDomainId) {
                                    findSelectedDomain($scope.parentNode);
                                    getCoursesByDomain($rootScope.selectedDomainId);
                                }
                                else {
                                    $rootScope.selectedDomainId = response.data[0].Id;
                                    $scope.selectedDomain = response.data[0];
                                    $rootScope.selectedDomain = response.data[0];
                                    getCoursesByDomain($rootScope.selectedDomainId);
                                }
                            }
                        }
                        else {
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

            function findSelectedDomain(parentNode) {
                var children = []
                if (parentNode == null) { //root node
                    children = $scope.treeData
                }
                else {
                    children = parentNode.Children
                }

                for (var i = 0; i < children.length; i++) {
                    if (children[i].Id == $rootScope.selectedDomainId) {
                        $scope.parentNodeOfSelectedDomain = angular.copy(parentNode);
                        $scope.selectedDomain = children[i];
                        return true;
                    } else {
                        $scope.expandedNodes.push(children[i]);
                        if (findSelectedDomain(children[i])) {
                            return true;
                        }
                        else {
                            $scope.expandedNodes.pop();
                        }
                    }
                }
                return false;
            }

            $scope.$on('eventGetDomain', function (event, args) {
                getDomains();
            });

            $scope.onDomainSelection = function (node) {
                $scope.selectedDomain = node;
                $rootScope.selectedDomainId = node.Id;
                getCoursesByDomain(node.Id);
            }

            function getCoursesByDomain(domainId) {
                $http({
                    method: "GET",
                    url: "CourseCatalog/GetCoursesByDomain",
                    params: {
                        domainId: domainId
                    },
                }).success(function (response) {
                    if (response.success) {
                        $scope.courses = response.data;

                        angular.forEach($scope.courses, function (course, key) {
                            angular.forEach(course.Classes, function (aClass, key) {
                                aClass.StartTimeFormat = moment(aClass.StartTime).format("MMM DD, YYYY");
                                aClass.EndTimeFormat = moment(aClass.EndTime).format("MMM DD, YYYY");
                                aClass.RegistrationDueTimeFormat = moment(aClass.RegistrationDueTime).format("MMM DD, YYYY");
                            });
                        });
                    }
                    else {
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
                })
            }

            $scope.openModalEditDomain = function (node) {
                $rootScope.selectedDomainId = node.Id;
                var modalInstance = $modal.open({
                    animation: false,
                    backdrop: 'static',
                    templateUrl: 'editDomainDialog.html',
                    controller: [
                        '$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.updatedNode = angular.copy(node);

                            $scope.save = function (editDomainForm) {
                                if (editDomainForm.$valid) {
                                    $http.post("CourseCatalog/UpdateDomain", {
                                        domainDto: {
                                            Id: $scope.updatedNode.Id,
                                            Name: $scope.updatedNode.Name
                                        }
                                    }).success(function (response) {
                                        if (response.success) {
                                            $modalInstance.dismiss();
                                            ModalService.showModal({}, {
                                                headerText: 'Update Category',
                                                bodyText: response.message
                                            });
                                            getDomains();
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
                            };
                            $scope.cancel = function () {
                                $modalInstance.dismiss();
                            };

                            $scope.nameSetArgs = function (val, el, attrs, ngModel) {
                                return { domainName: val, domainId: $scope.updatedNode.Id };
                            };
                        }
                    ],
                });
            }

            var findPreviousNode = function(treeData, id){
                for(var i = 0; i< treeData.length; i++){
                    if (treeData[i].Id == id) {
                        if (i == 0) {
                            if (treeData.length >= 2) {
                                return treeData[i + 1].Id;
                            }
                            else {
                                return null;
                            }
                           
                        }
                        else {
                            return treeData[i - 1].Id;
                        }
                      
                    }
                }
                return null;

            }

            $scope.deleteDomain = function (domainId) {
                $rootScope.selectedDomainId = domainId;
                var modalOptions = {
                    closeButtonText: 'Cancel',
                    actionButtonText: 'OK',
                    headerText: 'Delete Category',
                    bodyText: 'Are you sure you want to delete this category?'
                };
              
              
                ModalService.showModal({}, modalOptions).then(function (result) {
                    $http.post("CourseCatalog/DeleteDomain", {
                        domainId: domainId
                    }).success(function (response) {
                        if (response.success) {
                            findSelectedDomain();
                            if ($scope.selectedDomain.ParentId) {

                            }
                            $rootScope.selectedDomainId = null;
                            if ($scope.parentNodeOfSelectedDomain && $scope.parentNodeOfSelectedDomain.Id) {
                                if ($scope.parentNodeOfSelectedDomain.Children.length>1) {
                                    var previousId = findPreviousNode($scope.parentNodeOfSelectedDomain.Children, domainId);
                                    $rootScope.selectedDomainId = previousId;
                                }
                                else {
                                    $rootScope.selectedDomainId = $scope.parentNodeOfSelectedDomain.Id;
                                }
                            }
                            else {
                                // no parent
                                var previousId = findPreviousNode($scope.treeData, domainId);
                                $rootScope.selectedDomainId = previousId;
                            }
                            getDomains();
                           
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

            $scope.openModalAddDomain = function (parentNode) {
                if (parentNode) {
                    $rootScope.selectedDomainId = parentNode.Id;
                }
              
                var modalInstance = $modal.open({
                    animation: false,
                    backdrop: 'static',
                    templateUrl: 'addDomainDialog.html',
                    scope: $scope,
                    controller: [
                        '$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.checkExistDomainName = function (domainName) {
                                if ($scope.domainNames.indexOf(domainName.trim()) != -1) {
                                    $scope.isExistDomainName = true;
                                }
                                else {
                                    $scope.isExistDomainName = false;
                                }
                            }

                            $scope.save = function (addDomainForm) {
                                if (addDomainForm.$valid) {
                                    var domain = {};

                                    if (parentNode == null) {
                                        domain = {
                                            Name: $scope.name
                                        }
                                    } else {
                                        domain = {
                                            Name: $scope.name,
                                            ParentId: parentNode.Id
                                        }
                                    }
                                    $http.post("CourseCatalog/AddDomain", {
                                        domainDto: domain
                                    }).success(function (response) {
                                        if (response.success == true) {
                                            ModalService.showModal({}, {
                                                headerText: 'Add Category',
                                                bodyText: response.message
                                            });
                                            $rootScope.selectedDomainId = response.data.Id;
                                            getDomains();
                                            $modalInstance.dismiss();
                                        } else {
                                            ModalService.showModal({}, {
                                                headerText: 'Error',
                                                bodyText: response.message
                                            });
                                        }
                                    })
                                    .error(function (response) {
                                        ModalService.showModal({}, {
                                            headerText: 'Error',
                                            bodyText: response.message
                                        });
                                    });
                                }
                            };
                            $scope.cancel = function () {
                                $modalInstance.dismiss();
                            };

                            $scope.nameSetArgs = function (val, el, attrs, ngModel) {
                                return { domainName: val };
                            };
                        }
                    ],
                });
            }

            $scope.deleteCourse = function (courseId) {
                var modalOptions = {
                    closeButtonText: 'Cancel',
                    actionButtonText: 'OK',
                    headerText: 'Delete Course',
                    bodyText: 'Are you sure you want to delete this course?'
                };

                ModalService.showModal({}, modalOptions).then(function (result) {
                    $http.post("Course/DeleteCourse", {
                        courseId: courseId
                    }).success(function (response) {
                        if (response.success) {
                            ModalService.showModal({}, {
                                headerText: 'Delete Course',
                                bodyText: response.message
                            });
                            getDomains();
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

            $scope.hoverIn = function (node) {
                node.onHovering = true;
            }

            $scope.hoverOut = function (node) {
                node.onHovering = false;
            }

            $scope.hoverInX = function (course) {
                course.onHovering = true;
            }

            $scope.hoverOutX = function (course) {
                course.onHovering = false;
            }

            $scope.hasOpenClass = function (course) {
                var hasOpenClass = false;
                angular.forEach(course.Classes, function (aClass, key) {
                    if (course.IsVisible && !course.IsDeleted && !aClass.IsDeleted
                        && aClass.Status.trim() !== 'Cancelled'
                       && moment(aClass.EndTime).unix() > moment(new Date()).unix()) {
                        hasOpenClass = true;
                    }
                });
                return hasOpenClass;
            }

            $scope.hasAddCoursePermission = function () {
                return AuthService.isAuthorized([USER_ROLES.ADMIN, USER_ROLES.TTC_USER,
                    USER_ROLES.TTC_MANAGER]);
            }

            $scope.isTTCCoordinator = function () {
                return AuthService.isAuthorized([USER_ROLES.TTC_CORDINATOR]);
            }

            $scope.getColor = function (isVisible) {
                if (isVisible == true) {
                    return "background-color-isVisible-color";
                }
                else{
                    return "background-color-not-isVisible-color";
                }
            }
        }]);
