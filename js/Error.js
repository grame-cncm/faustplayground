//class ErrorFaust
var ErrorFaust = (function () {
    function ErrorFaust() {
    }
    ErrorFaust.errorCallBack = function (errorMessage) {
        new Message(errorMessage);
    };
    return ErrorFaust;
})();
//# sourceMappingURL=Error.js.map