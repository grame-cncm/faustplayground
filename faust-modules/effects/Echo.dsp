declare name "Echo";

import("stdfaust.lib");

/* ============ DESCRIPTION =============

- Variable de.delay echo
- Echo Delay = Pick manually which amount of time in seconds must be repeated by the echo
- Rocking = To vary the intensity of the echo

*/

process = echo;

echo = +~ @(echoDelay)*(feedback);

echoDelay = hslider("Echo Delay[unit:s]", 0.5, 0.01, 1, 0.001):min(1):max(0.01)*(44100):int;
feedback = hslider("Echo Intensity (Feedback)[style:knob][acc:0 1 -10 0 10]", 0.001, 0.001, 0.65, 0.001):si.smooth(0.999);
