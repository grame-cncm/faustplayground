//ExportView
var ExportView = (function () {
    function ExportView() {
    }
    ExportView.prototype.initExportView = function () {
        var exportContainer = document.createElement("div");
        exportContainer.id = "exportContent";
        exportContainer.className = "menuContent";
        var fwurl = document.createElement("input");
        fwurl.id = "faustweburl";
        fwurl.value = "http://faustservice.grame.fr";
        var subfooter = document.createElement('div');
        subfooter.id = "optionExportContainer";
        var refreshButton = document.createElement("div");
        refreshButton.id = "refreshButton";
        refreshButton.innerHTML = '<svg version="1.0" id="svgRefreshButton" xmlns="http://www.w3.org/2000/svg" width="50.000000pt" height="50.000000pt" viewBox="0 0 50.000000 50.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"> <path d="M186 309 c-37 -29 -37 -89 0 -118 28 -22 69 -27 93 -12 23 15 3 30 -33 24 -29 -4 -37 -1 -51 21 -16 24 -16 28 -1 51 18 27 63 34 84 13 17 -17 15 -31 -3 -24 -20 7 -19 1 6 -28 l22 -25 18 24 c20 25 25 40 9 30 -5 -3 -16 7 -24 23 -25 47 -75 56 -120 21z"/></g></svg>';
        subfooter.appendChild(refreshButton);
        this.refreshButton = refreshButton;
        var selectDiv = document.createElement("div");
        selectDiv.id = "selectDiv";
        subfooter.appendChild(selectDiv);
        var selectPlatform = document.createElement("select");
        selectPlatform.id = "platforms";
        selectPlatform.className = "platforms";
        var self = this;
        this.selectPlatform = selectPlatform;
        selectDiv.appendChild(selectPlatform);
        var selectArch = document.createElement("select");
        selectArch.id = "architectures";
        selectArch.className = "architectures";
        selectDiv.appendChild(selectArch);
        var exportButton = document.createElement("input");
        exportButton.id = "exportButton";
        exportButton.type = "submit";
        exportButton.className = "grayButton";
        exportButton.value = "Export";
        this.exportButton = exportButton;
        subfooter.appendChild(exportButton);
        exportContainer.appendChild(fwurl);
        exportContainer.appendChild(subfooter);
        return exportContainer;
    };
    return ExportView;
})();
//# sourceMappingURL=ExportView.js.map