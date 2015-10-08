declare name "Modulation 3";
declare author "ER";

import("math.lib"); 
import("maxmsp.lib"); 
import("music.lib"); 
import("oscillator.lib"); 
import("reduce.lib"); 
import("filter.lib"); 
import("effect.lib");

import("music.lib");
import("instrument.lib");

/* =========== DESCRIPTION ==============

- Non Linear Filter Modulators applied to a sinewave
- Head = Silence/Higher Frequencies/No modulation
- Bottom = Lower Frequencies/ Modulation n°3
- Rocking = Modulating Frequency (low to high)

*/

//======================== INSTRUMENT =============================

process = vgroup("NLFMs",oscil : NLFM3 : lowpass(1,2000) *(0.6)*(vol));

NLFM3 = _ : nonLinearModulator((nonlinearity:smooth(0.999)),env,freq,typeMod,freqMod,nlfOrder) : _;
oscil = osci(freq);	
	
//======================== GUI SPECIFICATIONS =====================

freq = hslider("[2]Frequency [unit:Hz][acc:1 0 -10 0 15]", 330, 100, 1200, 0.1):smooth(0.999);
freqMod = hslider("[4]Modulating Frequency[style:knob][unit:Hz][acc:0 1 -10 0 10]", 1200, 900, 1700, 0.1):smooth(0.999);
vol = (hslider("[3]Volume[style:knob][acc:1 1 -10 0 10]", 0.5, 0, 1, 0.01)^2):smooth(0.999);

//------------------------ NLFM PARAMETERS ------------------------
nlfOrder = 6; 
nonlinearity = 0.8;
typeMod = 3;

env = ASR;
ASR = asr(a,s,r,t);
a = 3;
s = 100;
r = 2;
t = gate;

gate = hslider("[1]Modulation Type 3[acc:1 1 -10 0 10]", 0,0,1,1);
