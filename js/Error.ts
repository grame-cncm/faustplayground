/// <reference path="Messages.ts"/>

//class ErrorFaust

class ErrorFaust {

    static errorCallBack(errorMessage: string) {
        new Message(errorMessage);
    }
}
