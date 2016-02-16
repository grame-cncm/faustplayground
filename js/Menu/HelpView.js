//HelpView.ts: HelpView class contains the graphical structure of the help menu.
var HelpView = (function () {
    function HelpView() {
    }
    HelpView.prototype.initHelpView = function () {
        var helpContainer = document.createElement("div");
        helpContainer.id = "helpContent";
        helpContainer.className = "helpContent";
        return helpContainer;
    };
    return HelpView;
})();
//# sourceMappingURL=HelpView.js.map