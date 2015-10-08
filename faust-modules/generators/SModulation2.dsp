declare name "Modulation 2";
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
- Head = Silence/Higher Frequencies
- Bottom = Lower Frequencies
- Back = No modulation
- Front = Modulation n°2

*/

//======================== INSTRUMENT =============================

process = vgroup("NLFMs",oscil : NLFM2 : lowpass(1,2000) *(0.6)*(vol));

NLFM2 = _ : nonLinearModulator((nonlinearity:smooth(0.999)),env,freq,typeMod,freqMod,nlfOrder) : _;
oscil = osci(freq);	
	
//======================== GUI SPECIFICATIONS =====================

freq = hslider("[2]Frequency [unit:Hz][acc:1 0 -10 0 15]", 330, 100, 1200, 0.1):smooth(0.999);
freqMod = hslider("[4]Modulating Frequency[style:knob][unit:Hz][acc:0 1 -10 0 10]", 1200, 900, 1700, 0.1):smooth(0.999);
vol = (hslider("[3]Volume[style:knob][acc:1 1 -10 0 10]", 0.5, 0, 1, 0.01)^2):smooth(0.999);


//------------------------ NLFM PARAMETERS ------------------------
nlfOrder = 6; 
nonlinearity = 0.8;
typeMod = 2;

env = ASR;
ASR = asr(a,s,r,t);
a = 3;
s = 100;
r = 2;
t = gate;

gate = hslider("[1]Modulation Type 2[acc:2 0 -30 0 10]", 0,0,1,1);
