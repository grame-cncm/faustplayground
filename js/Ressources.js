/// <reference path="App.ts"/>
/// <reference path="Utilitary.ts"/>
//contains all the key of resources json files in folders ressources
var Ressources = (function () {
    function Ressources() {
    }
    //get ressource depending on the location, default is french
    Ressources.prototype.getRessources = function (app) {
        var _this = this;
        var localization = navigator.language;
        if (localization == "fr" || localization == "fr-FR") {
            Utilitary.getXHR("ressources/ressources_fr-FR.json", function (ressource) { _this.loadMessages(ressource, app); }, Utilitary.errorCallBack);
        }
        else {
            Utilitary.getXHR("ressources/ressources_fr-FR.json", function (ressource) { _this.loadMessages(ressource, app); }, Utilitary.errorCallBack);
        }
    };
    // load the json object
    Ressources.prototype.loadMessages = function (ressourceJson, app) {
        Utilitary.messageRessource = JSON.parse(ressourceJson);
        resumeInit(app);
    };
    return Ressources;
}());
//# sourceMappingURL=Ressources.js.map