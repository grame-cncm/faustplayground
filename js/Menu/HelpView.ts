//HelpView.ts: HelpView class contains the graphical structure of the help menu.

interface HTMLIFrameYoutubeElement extends HTMLIFrameElement {
    allowScriptAccess: string;
    stopVideo: ()=>any;
}

class HelpView {
    videoContainer: HTMLElement;
    videoIframe: HTMLIFrameYoutubeElement;

    initHelpView(): HTMLElement {
        var helpContainer: HTMLElement = document.createElement("div");
        helpContainer.id = "helpContent";
        helpContainer.className = "helpContent";

        var videoContainer: HTMLElement = document.createElement("div");
        videoContainer.id = "videoContainer";

        this.videoContainer = videoContainer;
        helpContainer.appendChild(videoContainer);

        return helpContainer;
    }
}