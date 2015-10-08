declare name "Comb Filter";

/* =========== DESCRIPTION ==============

- A comb filter creates interferences in a sound
- Rocking = to change the filtering frequency
- Head = no filter
- Bottom = maximum filtering

*/

import("math.lib");
import("music.lib");
import("filter.lib");

process = fb_fcomb(maxdel,del,b0,aN) 
			with {
				maxdel = 1<<16;  
				freq = 1/(hslider("Frequency[acc:0 0 -10 0 10]", 2500,100,20000,0.001)):smooth(0.99);
				del = freq *(SR) : smooth(0.99);
				b0 = 1;
				aN = hslider("Intensity[acc:1 1 -10 0 10]", 80,0,100,0.01)*(0.01):smooth(0.99):min(0.999):max(0);
			};
			
