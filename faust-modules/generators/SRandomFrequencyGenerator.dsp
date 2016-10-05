declare name "Random Frequency Generator";
declare author "ER";

/* ============ DESCRIPTION ============

- Random Frequency Generator
- Head = High Frequencies
- Bottom = Low frequencies
- Left = Slow rhythm
- Right = Fast rhythm

*/

import("stdfaust.lib");

process = vgroup("Random Frequency Generator", randfreq : os.osc);

sampleAndhold(t) = select2(t) ~_;

randfreq = no.noise : sampleAndhold(gate)*(lowhigh) : si.smooth(0.99)
with{
lowhigh = hslider("[2]Hight[tooltip: frequency range hight factor][acc:1 1 -10 0 10]", 1000, 300, 2500, 1):si.smooth(0.999):min(1500):max(10);
};


gate = hand : upfront : counter <=(0)
with{
hand = hslider("[1]Instrument Hand[acc:0 1 -10 0 10]", 8, 0, 15, 1) :ba.automat(bps, 15, 0.0);
bps = hslider("[4]Speed[style:knob][acc:0 1 -10 0 10]", 420, 180, 720, 1) : si.smooth(0.999) : min(720) : max(180) : int;
upfront(x) = abs(x-x') > 0;
counter(g) = (+(1):*(1-g))~_;
};


