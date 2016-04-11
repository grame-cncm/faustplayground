/*				TOOLTIPS.JS
	Add tooltips for the pedagogical version of the playground

	DEPENDENCIES :
		- SceneClass.js
		- ModuleClass.js
*/
/// <reference path="../Main.ts"/>
/// <reference path="../App.ts"/>
/// <reference path="../Scenes/SceneClass.ts"/>


class Tooltips{
    /*************** ALL TOOLTIP CHOICES ***************************/
    static changeSceneToolTip(toolTipNumber: number):void {

        var subtitle: HTMLElement;

	    if(document.getElementById("sceneToolTip"))
		    subtitle = document.getElementById("sceneToolTip");
	    else{
		    subtitle = document.createElement('span');
		    subtitle.id="sceneToolTip";
		    document.getElementById("header").appendChild(subtitle);
	    }

	    if(toolTipNumber == 0){
		    subtitle.textContent = "    Choisis de télécharger ton application, " + document.getElementById("PatchName").innerHTML + ", pour ton smartphone ou sous forme de page web";
	    }
	    else if(toolTipNumber == 1){
		    subtitle.textContent = "    Glisse ta souris sur la bibliothèque Faust pour découvrir son contenu";
	    }
	    else if(toolTipNumber == 3){
		    subtitle.textContent = "    Relie ton instrument à ton effet en connectant le noeud rouge au noeud vert";
	    }
	    else if(toolTipNumber == 4){
		    subtitle.textContent = "    Relie ton effet à la sortie audio";
	    }
	    else if(toolTipNumber == 5){
		    subtitle.textContent = "    Joue avec ton/tes instrument(s)";
	    }
	    else if(toolTipNumber == 6){
		    subtitle.textContent = "    Choisis au moins un instrument";
	    }
    }

    /*************** ACTIVATE/DISACTIVATE TOOLTIPS ****************/
    enableTooltips():void {
        App.isTooltipEnabled = true;
    }
    
    static disableTooltips():void {
        App.isTooltipEnabled = false;
    }

    isTooltipEnabled(): boolean {
        return App.isTooltipEnabled;
    }


    /******** INTERROGATE THE SCENE TO CREATE RIGHT TOOLTIP ******/
    static sceneHasInstrumentAndEffect(scene: Scene):boolean {

        var modules: ModuleClass[] = scene.getModules();

	    if(modules.length<2)
		    return false
	    else{

		    var hasInstrument = false;
		    var hasEffect = false;

            for (var i = 0; i < modules.length; i++) {
                if (modules[i].moduleView.getInputNode())
				    hasEffect = true;
			    else
				    hasInstrument = true;
		    }
	    }

	    return hasInstrument && hasEffect;
    }

    static isInstrumentConnected(scene: Scene): boolean{

        var modules: ModuleClass[] = scene.getModules();

        for (var i = 0; i < modules.length; i++) {
            if (!modules[i].moduleView.getInputNode() && modules[i].moduleFaust.getOutputConnections() && modules[i].moduleFaust.getOutputConnections().length > 0)
			    return true;
	    }

	    return false;
    }

    toolTipForLibrary(type: string): HTMLDivElement {

        var tooltip: HTMLDivElement = document.createElement("div");

        var image: HTMLSpanElement = document.createElement('span');
	    image.className= "number";

	    var subtitle:Text;

	    if(type == "instruments"){
		    image.textContent = "1";
		    subtitle = document.createTextNode( "     Glisse l'instrument de ton choix dans la scene");
	    } else if (type == "effets") {
		    image.textContent = "2";
		    subtitle = document.createTextNode( "     Glisse l'effet de ton choix dans la scene");
	    } else if (type == "exemples") {
		    image.textContent = "3";
		    subtitle = document.createTextNode( "     Ou glisse un exemple tout fait");		
	    }

	    tooltip.appendChild(image);
	    tooltip.appendChild(subtitle);
	    return tooltip;
    }

    static toolTipForConnections(scene: Scene):void{

        var currentScene: Scene = scene;

        if (App.isTooltipEnabled) {

            var connectedNode: ModuleClass = currentScene.getAudioOutput();

		    while(connectedNode){

                // 			Node is an effect
                if (connectedNode.moduleView.getInputNode()) {

                    //	 		Node is connected
                    if (connectedNode.moduleFaust.getInputConnections() && connectedNode.moduleFaust.getInputConnections().length > 0)
                        connectedNode = connectedNode.moduleFaust.getInputConnections()[0].source;
                    //	 		Node is not connected and there is everything on the scene
                    else if (this.sceneHasInstrumentAndEffect(scene)) {
					    if(!this.isInstrumentConnected(scene))
						    this.changeSceneToolTip(3);
					    else
						    this.changeSceneToolTip(4);

					    connectedNode = null;
				    }
    // 			Node is not connected and there are no instruments on the scene
				    else{
					    this.changeSceneToolTip(6);
					    connectedNode = null;
				    }
			    }
    //	 		Node is an instrument
			    else{
				    this.changeSceneToolTip(5);
				    connectedNode = null;
			    }
		    }
	    }
    }
}
