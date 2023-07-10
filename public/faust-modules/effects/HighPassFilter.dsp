declare name "High Pass Filter";
import("stdfaust.lib");

/* ========= DESCRITPION ===========

- A high pass filter blocks all the frequencies inferior to the designated CUT-OFF FREQUENCY
- Front = no filter
- Back = maximum filtering
- Rocking = Increase/Decrease of the filtering
*/

process = _:fi.highpass(2,fc):_

    with {
        fc = hslider("Cut-off Frequency[acc:2 0 -10 0 10][scale:log]", 1300, 10, 20000, 0.01):si.smooth(0.999):min(20000):max(10);
    };
