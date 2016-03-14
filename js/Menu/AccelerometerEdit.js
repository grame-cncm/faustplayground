//AccelerometerEdit
var AccelerometerEdit = (function () {
    function AccelerometerEdit(accelerometerEditView) {
        var _this = this;
        this.isOn = false;
        this.accelerometerEditView = accelerometerEditView;
        this.eventEditHandler = function (event, accelerometer) { _this.editEvent(event, accelerometer); };
        this.accelerometerEditView.cancelButton.addEventListener("click", function () { _this.cancelAccelerometerEdit(); });
    }
    AccelerometerEdit.prototype.editAction = function (scene) {
        var _this = this;
        if (this.isOn) {
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i];
                currentAccSlide.mySlider.parentElement.removeEventListener("click", function (event) { _this.eventEditHandler(event, currentAccSlide); }, true);
                currentAccSlide.mySlider.parentElement.removeEventListener("touchstart", function (event) { _this.eventEditHandler(event, currentAccSlide); }, true);
            }
            this.isOn = false;
        }
        else {
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i];
                currentAccSlide.mySlider.parentElement.addEventListener("click", function (event) { _this.eventEditHandler(event, currentAccSlide); }, true);
                currentAccSlide.mySlider.parentElement.addEventListener("touchstart", function (event) { _this.eventEditHandler(event, currentAccSlide); }, true);
            }
            this.isOn = true;
        }
    };
    AccelerometerEdit.prototype.editEvent = function (event, accSlider) {
        event.stopPropagation();
        event.preventDefault();
        window.addEventListener("resize", this.placeElement);
        this.placeElement();
        this.accelerometerEditView.radioAxisContainer;
    };
    AccelerometerEdit.prototype.cancelAccelerometerEdit = function () {
        this.accelerometerEditView.blockLayer.style.display = "none";
    };
    AccelerometerEdit.prototype.placeElement = function () {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 2 + "px";
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 4 + "px";
    };
    return AccelerometerEdit;
})();
//# sourceMappingURL=AccelerometerEdit.js.map