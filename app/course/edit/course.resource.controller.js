'use strict';
angular.module('mainApp').controller('CourseResource',
    ['$scope', '$http', 'cfpLoadingBar', '$filter', '$stateParams', 'ModalService', 'Upload', 'moment', 'DTOptionsBuilder', 'DTColumnDefBuilder',
        function ($scope, $http, cfpLoadingBar, $filter, $stateParams, ModalService, Upload, moment, DTOptionsBuilder, DTColumnDefBuilder) {

            init();
            function init() {
                $scope.courseId = $stateParams.id;
                $scope.link = {};
                $scope.file = {};
                $scope.number = "";

                getCourseDocuments();

                $scope.uploadFileName = "";

                $scope.actions = [
                    { id: '1', name: 'Add file' },
                    { id: '2', name: 'Add link' }
                ];

                $scope.isAddingFile = true;

                $scope.setAction = function (action) {
                    if (action.id == 1) {
                        $scope.selectedAction = action;
                        $scope.isAddingFile = true;
                        $scope.isAddingLink = false;
                    } else {
                        $scope.selectedAction = action;
                        $scope.isAddingFile = false;
                        $scope.isAddingLink = true;
                    }
                };

                $scope.dtOptions = DTOptionsBuilder.newOptions()
                  .withOption('bFilter', false)
                  .withOption('bInfo', false)
                  .withOption('bPaginate', false)
                  .withOption('bLengthChange', false)
                  .withOption('columnDefs', [{ "sortable": false, "targets": [0, 5] }])

                $scope.dtColumnDefs = [
                   DTColumnDefBuilder.newColumnDef(0).notSortable(),
                   DTColumnDefBuilder.newColumnDef(5).notSortable()
                ];

                $scope.dtInstanceCallback = function (dtInstance) {
                    dtInstance.DataTable.on('order.dt', function () {
                        dtInstance.DataTable.column(0).nodes().each(function (cell, i) {
                            cell.innerHTML = i + 1;
                        });
                    });
                }

                $scope.link.Url = 'http://';

                $scope.extensions = [
                    { id: '.mp3', name: 'fa fa-file-audio-o fa-2x' },
                    { id: '.gif', name: 'fa fa-picture-o fa-2x' },
                    { id: '.png', name: 'fa fa-picture-o fa-2x' },
                    { id: '.jpg', name: 'fa fa-picture-o fa-2x' },
                    { id: '.jpeg', name: 'fa fa-picture-o fa-2x' },
                    { id: '.pdf', name: 'fa fa-file-pdf-o fa-2x' },
                    { id: '.pps', name: 'fa fa-file-powerpoint-o fa-2x' },
                    { id: '.ppt', name: 'fa fa-file-powerpoint-o fa-2x' },
                    { id: '.pptx', name: 'fa fa-file-powerpoint-o fa-2x' },
                    { id: '.doc', name: 'fa fa-file-word-o fa-2x' },
                    { id: '.docx', name: 'fa fa-file-word-o fa-2x' },
                    { id: '.xls', name: 'fa fa-file-excel-o fa-2x' },
                    { id: '.xlsx', name: 'fa fa-file-excel-o fa-2x' },
                    { id: '.rar', name: 'fa fa-file-archive-o fa-2x' },
                    { id: '.zip', name: 'fa fa-file-archive-o fa-2x' },
                    { id: '.7z', name: 'fa fa-file-archive-o fa-2x' },
                    { id: '.mp4', name: 'fa fa-file-video-o fa-2x' },
                    { id: '.flv', name: 'fa fa-file-video-o fa-2x' },
                    { id: '.avi', name: 'fa fa-file-video-o fa-2x' },
                    { id: '.mpg', name: 'fa fa-file-video-o fa-2x' },
                    { id: '.wmv', name: 'fa fa-file-video-o fa-2x' },
                ];

                $scope.disabledUpload = false;
            }

            function getCourseDocuments() {
                if ($scope.courseId != "") {
                    $http.get("CourseResources/GetCourseDocuments", {
                        params: {
                            courseId: $scope.courseId,
                        },
                    }).success(function (response) {
                        if (response.success) {
                            $scope.documents = response.data;
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
            }

            function getCourseDocument(documentId) {
                for (var i = 0; i < $scope.documents.length; i++) {
                    if ($scope.documents[i].Id == documentId) {
                        return $scope.documents[i];
                    }
                }
            }

            $scope.delete = function (documentId) {
                var headerText = '';
                var bodyText = '';
                var result = getCourseDocument(documentId);
                if (result.IsLink) {
                    headerText = 'Delete Link';
                    bodyText = 'Are you sure you want to delete this link?';
                }
                else {
                    headerText = 'Delete Document';
                    bodyText = 'Are you sure you want to delete this document?';
                }

                var modalOptions = {
                    closeButtonText: 'Cancel',
                    actionButtonText: 'OK',
                    headerText: headerText,
                    bodyText: bodyText
                };

                ModalService.showModal({}, modalOptions).then(function (result) {
                    $http.post("CourseResources/DeleteCourseDocument", {
                        documentId: documentId
                    }).success(function (response) {
                        if (response.success) {
                            getCourseDocuments();
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
                });
            };

            $scope.uploadFile = function (fileForm) {
                if (fileForm.$valid) {
                    if ($scope.file.uploadedFile) {
                        $scope.isSendingRequest = true;
                        Upload.upload({
                            url: 'CourseResources/UploadFile',
                            data: {
                                courseId: $scope.courseId,
                                filename: $scope.file.uploadedFile,
                            }
                        }).then(function (response) {
                            if (response.data.success) {
                                getCourseDocuments();
                                $scope.file = {};

                                angular.forEach(
                                    angular.element("input[type='file']"),
                                    function (inputElem) {
                                        angular.element(inputElem).val(null);
                                    });

                                ModalService.showModal({}, {
                                    headerText: 'Add Document',
                                    bodyText: response.data.message
                                });

                                fileForm.$setPristine();
                                $scope.isSendingRequest = false;
                            } else {
                                ModalService.showModal({}, {
                                    headerText: 'Error',
                                    bodyText: response.data.message
                                });
                                $scope.isSendingRequest = false;
                            }

                        }, function (response) {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                                bodyText: response.data.message
                            });
                            $scope.isSendingRequest = false;
                        });
                    }
                }
            }

            $scope.uploadLink = function (linkForm, linkName, linkUrl) {
                if (linkForm.$valid) {
                    $scope.isSendingRequest = true;
                    $http.post("CourseResources/UploadLink", {
                        courseId: $scope.courseId,
                        name: linkName,
                        link: linkUrl
                    }).success(function (response) {
                        if (response.success) {
                            
                            getCourseDocuments();

                            $scope.link.Name = "";
                            $scope.link.Url = "http://";
                            linkForm.$setPristine();

                            ModalService.showModal({}, {
                                headerText: 'Add Link',
                                bodyText: response.message
                            });
                            $scope.isSendingRequest = false;
                        } else {
                            ModalService.showModal({}, {
                                headerText: 'Error',
                                bodyText: response.message
                            });
                            $scope.isRequesting = false;
                        }
                    })
                     .error(function (response) {
                         ModalService.showModal({}, {
                             headerText: 'Error',
                             bodyText: response.message
                         });
                         $scope.isSendingRequest = false;
                     });
                    
                }
            }

            $scope.getIconByExtension = function (extension) {
                var iconClass = null;
                angular.forEach($scope.extensions, function (value, key) {
                    if (value.id == extension) {
                        iconClass = value;
                    }
                });
                return iconClass;
            }
        }]);
