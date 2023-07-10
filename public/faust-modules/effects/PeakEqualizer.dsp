declare name "Peak Equalizer";

import("stdfaust.lib");

/* =========== DESCRITPION ==============

- An Equalizer - or EQ - is used to cut or boost a designated peak frequency from a sound
- The Q - FILTER BANDWIDTH indicates in Hz the width of the frequency band around the peak frequency impacted by the cut or boost

- Front = Boosting effect/ Narrow band
- Back = Cutting effect/ Wide band
- Left = Low peak frequency
- Right = High peak frequency

*/

process = vgroup("Peak EQ",fi.peak_eq(level,freq,Q))

    with {
        level = hslider("[2]Level[unit:dB][style:knob][acc:2 1 -10 0 10][tooltip: boost Level>0 or cut Level<0)", 0, -40, 32, 0.01):min(32):max(-40);
        freq = hslider("[1]Peak Frequency[unit:Hz][acc:0 1 -10 0 10][scale:log]", 440, 50, 11000, 0.01):si.smooth(0.999);
        Q = hslider("Q - Filter Bandwidth [unit:Hz][acc:2 0 -10 0 10]", 50, 20, 200, 1):si.smooth(0.999):min(200):max(20);
    };
