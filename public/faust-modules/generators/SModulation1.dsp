declare name "Modulation 1";
declare author "ER";

import("stdfaust.lib");
instrument = library("instruments.lib");

/* =========== DESCRIPTION ==============

- Non Linear Filter Modulators applied to a sinewave
- Head = Silence/Higher Frequencies
- Bottom = Lower Frequencies
- Right = No modulation
- Left = Modulation n°1

*/

//======================== INSTRUMENT =============================

process = vgroup("NLFM",oscil : NLFM1 : fi.lowpass(1,2000) *(0.6)*(vol));

NLFM1 = _ : instrument.nonLinearModulator((nonlinearity:si.smooth(0.999)),env,freq,typeMod,freqMod,nlfOrder) : _;
oscil = os.osc(freq);	
	
//======================== GUI SPECIFICATIONS =====================

freq = hslider("[2]Frequency [unit:Hz][acc:1 1 -10 0 15]", 330, 100, 1200, 0.1):si.smooth(0.999);
vol = (hslider("[3]Volume[style:knob][acc:1 0 -10 0 10]", 0.5, 0, 1, 0.01)^2):si.smooth(0.999);


//------------------------ NLFM PARAMETERS ------------------------
nlfOrder = 6; 
nonlinearity = 0.8;
typeMod = 1;
freqMod = hslider("[4]Modulating Frequency[style:knob][unit:Hz][acc:0 0 -10 0 10]", 1200, 900, 1700, 0.1):si.smooth(0.999);

env = ASR;
ASR = en.asr(a,s,r,t);
a = 3;
s = 1;
r = 2;
t = gate;

gate = hslider("[1]Modulation Type 1[tooltip:noteOn = 1, noteOff = 0][acc:0 0 -30 0 5]", 0,0,1,1);
