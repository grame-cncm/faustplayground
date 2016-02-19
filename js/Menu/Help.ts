//Help.ts : Help class, that controle behaviour of the help panel.

class Help {
    helpView: HelpView;
    stopVideo() {
        this.helpView.videoContainer.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
    }

}