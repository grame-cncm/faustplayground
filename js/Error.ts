//class ErrorFaust

class ErrorFaust {

    static errorCallBack(errorMessage: string) {
        new Message(errorMessage);

    }
}