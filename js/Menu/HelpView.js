//HelpView.ts: HelpView class contains the graphical structure of the help menu.
var HelpView = (function () {
    function HelpView() {
    }
    HelpView.prototype.initHelpView = function () {
        var helpContainer = document.createElement("div");
        helpContainer.id = "helpContent";
        helpContainer.className = "helpContent";
        var videoIFrame = document.createElement("iframe");
        //videoIFrame.id = "videoIFrame";
        //videoIFrame.width = "600";
        //videoIFrame.height = "300";
        //videoIFrame.src = "https://www.youtube.com/embed/6pnfzL_kBD0?enablejsapi=1&version=3&playerapiid=ytplayer";
        //videoIFrame.frameBorder = "0";
        //videoIFrame.allowFullscreen = true;
        //videoIFrame.setAttribute("allowscriptaccess", "always");
        //this.videoIframe = videoIFrame;
        var videoContainer = document.createElement("div");
        videoContainer.id = "videoContainer";
        //videoContainer.appendChild(videoIFrame);
        this.videoContainer = videoContainer;
        helpContainer.appendChild(videoContainer);
        //<iframe width="854" height= "480" src= "https://www.youtube.com/embed/6pnfzL_kBD0" frameborder= "0" allowfullscreen> </iframe>
        return helpContainer;
    };
    return HelpView;
})();
