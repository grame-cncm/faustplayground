declare name "Comb Filter";

/* =========== DESCRIPTION ==============

- A comb filter creates interferences in a sound
- Rocking = to change the filtering frequency
- Head = no filter
- Bottom = maximum filtering

*/

import("stdfaust.lib");

process = fi.fb_fcomb(maxdel,del,b0,aN) 
        with {
            maxdel = 1<<16;
            freq = 1/(hslider("Frequency[acc:0 1 -10 0 10]", 2500,100,20000,0.001)):si.smooth(0.99);
            del = freq *(ma.SR) : si.smooth(0.99);
            b0 = 1;
            aN = hslider("Intensity[acc:1 0 -10 0 10]", 80,0,100,0.01)*(0.01):si.smooth(0.99):min(0.999):max(0);
        };
        
