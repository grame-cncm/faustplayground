/// <reference path="App.ts"/>
/// <reference path="Utilitary.ts"/>
var Ressources = (function () {
    function Ressources() {
    }
    Ressources.prototype.getRessources = function (app) {
        var _this = this;
        // Utilitary.getXHR(
        var localization = navigator.language;
        if (localization == "fr" || localization == "fr-FR") {
            Utilitary.getXHR("ressources/ressources_fr-FR.json", function (ressource) { _this.loadMessages(ressource, app); }, Utilitary.errorCallBack);
        }
        else {
            Utilitary.getXHR("ressources/ressources_fr-FR.json", function (ressource) { _this.loadMessages(ressource, app); }, Utilitary.errorCallBack);
        }
    };
    Ressources.prototype.loadMessages = function (ressourceJson, app) {
        Utilitary.messageRessource = JSON.parse(ressourceJson);
        resumeInit(app);
    };
    return Ressources;
}());
//# sourceMappingURL=Ressources.js.map