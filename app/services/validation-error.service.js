'use strict';
angular.module('mainApp').provider("ErrorMessages", function() {

    this.errorMessages = {};

    this.$get = function () {
        var errorMessages = this.errorMessages;
        return {
            error: function (fieldName, errorType, parameters) {
                var messageConstant = errorMessages[errorType];

                if (!parameters) {
                    return fieldName + messageConstant || errorType;
                } else {
                    for (var i = 0; i < parameters.length; i++) {
                        messageConstant = messageConstant.replace('#', parameters[i]);
                    }
                    return messageConstant
                }
                
            }
        };
    };

    this.setErrorMessages = function (messages) {
        this.errorMessages = messages;
    };

});