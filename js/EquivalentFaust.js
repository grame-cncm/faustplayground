/*				EQUIVALENTFAUST.JS

    HELPER FUNCTIONS TO CREATE FAUST EQUIVALENT EXPRESSION FROM A PATCH
    
    FIRST PART --> DERECURSIVIZE THE PATCH
    SECOND PART --> CREATE THE FAUST EQUIVALENT FROM THE "DERECURSIVIZED" PATCH
*/
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Connect.ts"/>
/// <reference path="Main.ts"/>
"use strict";
var ModuleTree = (function () {
    function ModuleTree() {
    }
    return ModuleTree;
})();
var EquivalentFaust = (function () {
    function EquivalentFaust() {
    }
    EquivalentFaust.prototype.isModuleRecursiveExisting = function (moduleTree) {
        if (App.recursiveMap[moduleTree.patchID])
            return true;
        return false;
    };
    EquivalentFaust.prototype.giveIdToModules = function (scene) {
        var modules = scene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].patchID = String(i + 1);
        }
    };
    EquivalentFaust.prototype.treatRecursiveModule = function (moduleTree) {
        // 	Save recursion in map and flag it
        var ModuleToReplace = this.getFirstOccurenceOfModuleInCourse(moduleTree);
        App.recursiveMap[moduleTree.patchID] = ModuleToReplace;
        ModuleToReplace.recursiveFlag = true;
    };
    EquivalentFaust.prototype.getFirstOccurenceOfModuleInCourse = function (moduleTree) {
        for (var i = 0; i < moduleTree.course.length; i++) {
            if (moduleTree.patchID == moduleTree.course[i].patchID) {
                return moduleTree.course[i];
            }
        }
        return null;
    };
    EquivalentFaust.prototype.createTree = function (module, parent) {
        var moduleTree = new ModuleTree();
        moduleTree.patchID = module.patchID;
        moduleTree.course = [];
        if (parent) {
            // 		COPY PARENT COURSE
            for (var k = 0; k < parent.course.length; k++)
                moduleTree.course[k] = parent.course[k];
        }
        moduleTree.moduleInputs = [];
        moduleTree.recursiveFlag = false;
        if (this.isModuleRecursiveExisting(moduleTree)) {
            var ModuleToReuse = App.recursiveMap[moduleTree.patchID];
            moduleTree.sourceCode = ModuleToReuse.sourceCode;
            moduleTree.moduleInputs = ModuleToReuse.moduleInputs;
        }
        else if (this.getFirstOccurenceOfModuleInCourse(moduleTree)) {
            this.treatRecursiveModule(moduleTree);
            // 	Stop Recursion in Tree		
            moduleTree = null;
        }
        else if (module.patchID == "input") {
            moduleTree.sourceCode = module.moduleFaust.getSource();
            moduleTree.course[moduleTree.course.length] = moduleTree;
        }
        else {
            moduleTree.sourceCode = module.moduleFaust.getSource();
            moduleTree.course[moduleTree.course.length] = moduleTree;
            if (module.moduleFaust.getInputConnections()) {
                for (var j = 0; j < module.moduleFaust.getInputConnections().length; j++)
                    moduleTree.moduleInputs[j] = this.createTree(module.moduleFaust.getInputConnections()[j].source, moduleTree);
            }
        }
        return moduleTree;
    };
    /********************************************************************
    ***********************  CREATE FAUST EQUIVALENT ********************
    ********************************************************************/
    //*** The faust equivalent of a scene is calculated following these rules:
    //*** The tree starting from the output Module is computed (tree 1)
    //*** Then if there are unconnected output Modules, there Modules are computed (tree 2, ..., n)
    //*** All trees are composed in parallel
    //*** Every Faust Expression is "Stereoized" before composition with other expressions to ensure composability
    // Computing a Module is computing its entries and merging them in the Module's own faust code.
    EquivalentFaust.prototype.computeModule = function (module) {
        var moduleInputs = module.moduleInputs;
        var faustResult = "";
        // Iterate on input Modules to compute them
        if (moduleInputs && moduleInputs.length != 0) {
            var inputCode = "";
            for (var i = 0; i < moduleInputs.length; i++) {
                if (moduleInputs[i]) {
                    if (moduleInputs[i].sourceCode && moduleInputs[i].sourceCode.length > 0) {
                        if (i != 0)
                            inputCode += ",";
                        inputCode += this.computeModule(moduleInputs[i]);
                    }
                }
            }
            if (inputCode != "") {
                if (module.recursiveFlag)
                    faustResult += "(" + inputCode + ":> ";
                else
                    faustResult += inputCode + ":> ";
            }
        }
        var ModuleCode = module.sourceCode;
        if (module.recursiveFlag)
            faustResult += "stereoize(environment{" + ModuleCode + "}.process))~(_,_)";
        else
            faustResult += "stereoize(environment{" + ModuleCode + "}.process)";
        return faustResult;
    };
    // Computing the trees unconnected to the output
    EquivalentFaust.prototype.connectUnconnectedModules = function (faustModuleList, output) {
        for (var i in faustModuleList) {
            var outputNode = faustModuleList[i].moduleView.getOutputNode();
            if (faustModuleList[i].moduleFaust.fName != "input" && outputNode && (!faustModuleList[i].moduleFaust.getOutputConnections || !faustModuleList[i].moduleFaust.getOutputConnections() || faustModuleList[i].moduleFaust.getOutputConnections().length == 0)) {
                var connector = new Connector();
                connector.createConnection(faustModuleList[i], faustModuleList[i].moduleView.getOutputNode(), output, output.moduleView.getInputNode());
            }
        }
    };
    //Calculate Faust Equivalent of the Scene
    EquivalentFaust.prototype.getFaustEquivalent = function (scene, patchName) {
        var faustModuleList = scene.getModules();
        if (faustModuleList.length > 0) {
            var dest = scene.getAudioOutput();
            var src = scene.getAudioInput();
            if (src)
                src.patchID = "input";
            var faustResult = "stereoize(p) = S(inputs(p), outputs(p))\n\
				    with {\n\
				      // degenerated processor with no outputs\n\
				    S(n,0) = !,! : 0,0; 		// just in case, probably a rare case\n\
				    \n\
				      // processors with no inputs\n\
				    S(0,1) = p <: _/2,_/2; 	// add two fake inputs and split output\n\
				    S(0,2) = p;\n\
				    S(0,n) = p,p :> _,_;	// we are sure this will work if n is odd\n\
				     \n\
				      // processors with one input\n\
				    S(1,1) = p,p; 				// add two fake inputs and split output \n\
				    S(1,n) = p,p :> _/2,_/2;		// we are sure this will work if n is odd\n\
				     \n\
			      // processors with two inputs\n\
				    S(2,1) = p <: _,_; 			// split the output\n\
				    S(2,2) = p; 				// nothing to do, p is already stereo\n\
			     \n\
			      // processors with inputs > 2 and outputs > 2\n\
			    S(n,m) = _,_ <: p,p :> _,_;	// we are sure this works if n or p are odd\n\
			    };\n\
			    \n\
			    recursivize(p,q) = (_,_,_,_ :> stereoize(p)) ~ stereoize(q);\n\
			    ";
            this.connectUnconnectedModules(faustModuleList, dest);
            App.recursiveMap = [];
            this.giveIdToModules(scene);
            var destinationDIVVV = this.createTree(dest, null);
            if (dest.moduleFaust.getInputConnections())
                faustResult += "process = vgroup(\"" + patchName + "\",(" + this.computeModule(destinationDIVVV) + "));";
            // 		console.log(faustResult);
            return faustResult;
        }
        else
            return null;
    };
    return EquivalentFaust;
})();
//--------Plus Utilisé ---------------Create Faust Equivalent Module of the Scene
//    // To avoid sharing instances of a same factory in the resulting Faust Equivalent
//    wrapSourceCodesInGroups(){
//	    var modules = getElementsByClassName("div", "moduleFaust");
//	    for (var i = 0; i < modules.length; i++)
//		    modules[i].Source = "process = vgroup(\"component"+ i.toString() + "\",environment{" + modules[i].Source + "}.process);";
//    }
//    function createFaustEquivalent(scene, patchName, parent){
//    // Save All Params	
//	    var modules = scene.getModules();
//	    for (var i = 0; i < modules.length; i++){	
//		    if(modules[i])
//			    modules[i].saveParams();
//	    }
//    // Concatenate All Params
//	    var fullParams = new Array();
//	    for (var i = 0; i < modules.length; i++) {
//		    if(modules[i]){
//			    var arrayParams = modules[i].getParams;
//    //   BIDOUILLE!!!!! Adding component wrapping to avoid merging of 2 instances of same factory
//			    for(key in arrayParams){
//				    var newKey = "/" + patchName /*+ "/component" + i.toString()*/ + key;
//				    fullParams[newKey] = arrayParams[key];
//			    }
//		    }
//	    }
//    // THIS SHOULD BE DONE BUT FOR NOW IT CAUSED A PROBLEM, I CAN'T REMEMBER WHICH... 
//    // 	wrapSourceCodesInGroups();
//	    var faustResult = getFaustEquivalent(scene, patchName);
//	    if(faustResult){
//    // Save concatenated params in new DIV
//		    var DSP = createDSP(faustResult);
//		    if(DSP){
//			    var faustModule = createModule(idX++, document.body.scrollWidth/3, document.body.scrollHeight/3, patchName, parent, window.scenes[2].removeModule);
// 			    faustModule.createDSP(faustResult);
// 			    faustModule.setParams(fullParams);
// 			    return faustModule;
//		    }
//	    }
//	    return null;
//    }
//}
//# sourceMappingURL=EquivalentFaust.js.map