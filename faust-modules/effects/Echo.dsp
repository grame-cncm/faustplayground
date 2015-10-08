declare name "Echo";

import("math.lib");
import("music.lib");
import("filter.lib");

/* ============ DESCRIPTION =============

- Variable delay echo
- Echo Delay = Pick manually which amount of time in seconds must be repeated by the echo
- Rocking = To vary the intensity of the echo

*/

process = echo;


echo = +~ @(echoDelay)*(feedback);
smooth(s) = *(1.0 - s) : + ~ *(s);

echoDelay = hslider("Echo Delay[unit:s]", 0.5, 0.01, 1, 0.001):min(1):max(0.01)*(44100):int;
feedback = hslider("Echo Intensity (Feedback)[style:knob][acc:0 0 -10 0 10]", 0.001, 0.001, 0.65, 0.001):smooth(0.999);
