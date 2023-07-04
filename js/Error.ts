import { Message } from "./Messages";

class ErrorFaust {

    static errorCallBack(errorMessage: string) {
        new Message(errorMessage);
    }
}
