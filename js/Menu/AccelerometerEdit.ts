//AccelerometerEdit

class AccelerometerEdit {
    accelerometerEditView: AccelerometerEditView;
    isOn: boolean = false
    eventEditHandler: (event: Event, accSlide:AccelerometerSlider) => void;
    constructor(accelerometerEditView: AccelerometerEditView) {
        this.accelerometerEditView = accelerometerEditView
        this.eventEditHandler = (event: Event, accelerometer: AccelerometerSlider) => { this.editEvent(event, accelerometer) };
        this.accelerometerEditView.cancelButton.addEventListener("click", () => { this.cancelAccelerometerEdit() })
    }

    editAction(scene: Scene) {
        if (this.isOn) {

            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i]
                currentAccSlide.mySlider.parentElement.removeEventListener("click", (event) => { this.eventEditHandler(event, currentAccSlide) }, true);
                currentAccSlide.mySlider.parentElement.removeEventListener("touchstart", (event) => { this.eventEditHandler(event, currentAccSlide) }, true);

            }
            this.isOn = false;
        } else {
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i]
                currentAccSlide.mySlider.parentElement.addEventListener("click", (event) => { this.eventEditHandler(event, currentAccSlide) }, true);
                currentAccSlide.mySlider.parentElement.addEventListener("touchstart", (event) => { this.eventEditHandler(event, currentAccSlide) }, true);
            }
            this.isOn = true;
        }
    }
    editEvent(event: Event, accSlider: AccelerometerSlider):any {
        event.stopPropagation();
        event.preventDefault();
        window.addEventListener("resize", this.placeElement)
        this.placeElement();
        this.accelerometerEditView.radioAxisContainer


        
    }
    cancelAccelerometerEdit() {
        this.accelerometerEditView.blockLayer.style.display = "none";
    }
    placeElement() {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 2 + "px";
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 4 + "px";
    }


}