declare name "Random and Hold";
declare author "ER";

/* ========= DESCRIPTION ============

- Random frequency generator with hold function
- Head = Hold the last sampled note
- Swing = Generate random notes
- Left = Slow rhythm
- Right = Fast rhythm

*/

import("music.lib");
import("filter.lib");

process = noise : sampleAndhold(gate) * (1500) : smooth(0.99) :  osc : sampleAndhold(reverse(hold))<:select2(reverse(hold),(smooth(0.999) : *(1500):osc),_);

sampleAndhold(g) = select2(g) ~_;

reverse(t) = select2(t,1,0);

hold = hslider("[2]Hold[acc:1 0 -8 0 12]", 0, 0, 1, 1);
gate = hand : upfront : counter <=(0)
with{
hand = hslider("[1]Instrument hand[acc:1 1 -10 0 10]", 5, 0, 10, 1):automat(bps, 15, 0.0);
bps = hslider("[3]Speed[style:knob][acc:0 0 -10 0 10]", 480, 120, 720, 1) : smooth(0.999) : min(720) : max(120) : int;
upfront(x) = abs(x-x') > 0;
counter(g) = (+(1):*(1-g))~_;
};