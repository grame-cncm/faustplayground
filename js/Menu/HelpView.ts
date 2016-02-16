//HelpView.ts: HelpView class contains the graphical structure of the help menu.

class HelpView {
    initHelpView(): HTMLElement {
        var helpContainer: HTMLElement = document.createElement("div");
        helpContainer.id = "helpContent";
        helpContainer.className = "helpContent";
        return helpContainer;
    }
}