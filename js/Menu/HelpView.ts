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

        var videoIFrame: HTMLIFrameYoutubeElement = <HTMLIFrameYoutubeElement>document.createElement("iframe");
        videoIFrame.id = "videoIFrame";
        videoIFrame.width = "600";
        videoIFrame.height = "300";
        videoIFrame.src = "https://www.youtube.com/embed/6pnfzL_kBD0?enablejsapi=1&version=3&playerapiid=ytplayer";
        videoIFrame.frameBorder = "0";
        videoIFrame.allowFullscreen = true;
        videoIFrame.setAttribute("allowscriptaccess", "always");
        this.videoIframe = videoIFrame;

        var videoContainer: HTMLElement = document.createElement("div");
        videoContainer.id = "videoContainer";
        videoContainer.appendChild(videoIFrame);

        this.videoContainer = videoContainer;
        helpContainer.appendChild(videoContainer);


        //<iframe width="854" height= "480" src= "https://www.youtube.com/embed/6pnfzL_kBD0" frameborder= "0" allowfullscreen> </iframe>
        return helpContainer;


    }
}