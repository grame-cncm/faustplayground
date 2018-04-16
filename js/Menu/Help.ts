//Help.ts : Help class, that controle behaviour of the help panel.
/// <reference path="HelpView.ts"/>

class Help {
    helpView: HelpView;
    stopVideo() {
        //this.helpView.videoIframe.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
    }
}
