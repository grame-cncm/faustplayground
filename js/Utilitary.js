var Utilitary = (function () {
    function Utilitary() {
    }
    Utilitary.errorCallBack = function (message) {
    };
    Utilitary.showFullPageLoading = function () {
        document.getElementById("loadingPage").style.visibility = "visible";
        //too demanding for mobile firefox...
        //document.getElementById("Normal").style.filter = "blur(2px)"
        //document.getElementById("Normal").style.webkitFilter = "blur(2px)"
        //document.getElementById("menuContainer").style.filter = "blur(2px)"
        //document.getElementById("menuContainer").style.webkitFilter = "blur(2px)"
    };
    Utilitary.hideFullPageLoading = function () {
        document.getElementById("loadingPage").style.visibility = "hidden";
        //document.getElementById("Normal").style.filter = "none"
        //document.getElementById("Normal").style.webkitFilter = "none"
        //document.getElementById("menuContainer").style.filter = "none"
        //document.getElementById("menuContainer").style.webkitFilter = "none"
    };
    Utilitary.isAppPedagogique = function () {
        if (window.location.href.indexOf("kids.html") > -1) {
            return true;
        }
        else {
            return false;
        }
    };
    //generic function to make XHR request
    Utilitary.getXHR = function (url, callback, errCallback) {
        var getrequest = new XMLHttpRequest();
        getrequest.onreadystatechange = function () {
            console.log("enter onreadystatechange");
            if (getrequest.readyState == 4 && getrequest.status == 200) {
                callback(getrequest.responseText);
            }
            else if (getrequest.readyState == 4 && getrequest.status == 400) {
                errCallback(getrequest.responseText);
            }
        };
        getrequest.open("GET", url, true);
        getrequest.send(null);
    };
    Utilitary.addLoadingLogo = function (idTarget) {
        var loadingDiv = document.createElement("div");
        loadingDiv.className = "loadingDiv";
        var loadingImg = document.createElement("img");
        loadingImg.src = Utilitary.baseImg + "logoAnim.gif";
        loadingImg.id = "loadingImg";
        var loadingText = document.createElement("span");
        loadingText.textContent = Utilitary.messageRessource.loading;
        loadingText.id = "loadingText";
        loadingDiv.appendChild(loadingImg);
        loadingDiv.appendChild(loadingText);
        if (document.getElementById(idTarget) != null) {
            document.getElementById(idTarget).appendChild(loadingDiv);
        }
    };
    Utilitary.removeLoadingLogo = function (idTarget) {
        var divTarget = document.getElementById(idTarget);
        if (divTarget != null && divTarget.getElementsByClassName("loadingDiv").length > 0) {
            while (divTarget.getElementsByClassName("loadingDiv").length != 0) {
                divTarget.getElementsByClassName("loadingDiv")[0].remove();
            }
        }
    };
    Utilitary.addFullPageLoading = function () {
        var loadingText = document.getElementById("loadingTextBig");
        loadingText.id = "loadingTextBig";
        loadingText.textContent = Utilitary.messageRessource.loading;
    };
    Utilitary.replaceAll = function (str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    };
    Utilitary.messageRessource = new Ressources();
    Utilitary.idX = 0;
    Utilitary.baseImg = "img/";
    Utilitary.isAccelerometerOn = false;
    Utilitary.isAccelerometerEditOn = false;
    return Utilitary;
}());
//# sourceMappingURL=Utilitary.js.map