declare name "Band Pass Filter";

/* ============ DESCRITPION ============

- A band pass filter blocks all the frequencies but the designated frequency band
- The slider CENTER FREQUENCY corresponds to the center frequency of the band
- The slider Q - FILTER BANDWIDTH indicates the width of the band in Hz around the center frequency.
- Head = High center frequency
- Bottom = Low center frequency
- Left = narrow band
- Right = wide band

*/

import("music.lib");
import("filter.lib");



process = _:bandpass(1, Lowf, Highf):_

with{
	freq = hslider("[1]Center Frequency[unit:Hz][style:log][acc:1 0 -10 0 10]", 200, 50, 10000, 0.01):smooth(0.999);
	Lowf = freq - Q;
	Highf = freq + Q;
	Q = hslider("Q - Filter Bandwidth[style:knob][unit:Hz][acc:0 0 -10 0 10]", 20,2,200,0.0001)*(0.5):smooth(0.999);	
	};
	
