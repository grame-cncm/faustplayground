//class ErrorFaust
var ErrorFaust = (function () {
    function ErrorFaust() {
    }
    ErrorFaust.errorCallBack = function (errorMessage) {
        alert(errorMessage);
    };
    return ErrorFaust;
})();
