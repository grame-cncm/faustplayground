declare name "WahWah";

/* ========== DESCRIPTION ===========

- Wahwah effect
- Head = no effect
- Bottom = Maximum wahwah intensity
- Rocking = varying the Wahwah effect

*/

import("stdfaust.lib");

process = _<:_,ve.crybaby(wah):drywet
	with {
   		wah = hslider("[1]Wah Wah[acc:0 1 -10 0 10]", 0.6,0,1,0.01) : ba.automat(bps, 15, 0.0);
   		bps = hslider("[2]Speed[acc:0 1 -10 0 10]", 540, 360, 780, 0.1):si.smooth(0.999):min(780):max(360):int;
		drywet(x,y) = (1-c)*x + c*y;
		c = hslider("[3]Wah wah intensity[style:knob][unit:%][acc:1 0 -10 0 10]", 60,0,100,0.01)*(0.01):si.smooth(0.999):min(1):max(0);
    };
