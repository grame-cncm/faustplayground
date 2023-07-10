declare name "Modulation 3";
declare author "ER";

import("stdfaust.lib");
instrument = library("instruments.lib");

/* =========== DESCRIPTION ==============

- Non Linear Filter Modulators applied to a sinewave
- Head = Silence/Higher Frequencies/No modulation
- Bottom = Lower Frequencies/ Modulation n°3
- Rocking = Modulating Frequency (low to high)

*/

//======================== INSTRUMENT =============================

process = vgroup("NLFMs",oscil : NLFM3 : fi.lowpass(1,2000) *(0.6)*(vol));

NLFM3 = _ : instrument.nonLinearModulator((nonlinearity:si.smooth(0.999)),env,freq,typeMod,freqMod,nlfOrder) : _;
oscil = os.osci(freq);	
	
//======================== GUI SPECIFICATIONS =====================

freq = hslider("[2]Frequency [unit:Hz][acc:1 1 -10 0 15]", 330, 100, 1200, 0.1):si.smooth(0.999);
freqMod = hslider("[4]Modulating Frequency[style:knob][unit:Hz][acc:0 0 -10 0 10]", 1200, 900, 1700, 0.1):si.smooth(0.999);
vol = (hslider("[3]Volume[style:knob][acc:1 0 -10 0 10]", 0.5, 0, 1, 0.01)^2):si.smooth(0.999);

//------------------------ NLFM PARAMETERS ------------------------
nlfOrder = 6; 
nonlinearity = 0.8;
typeMod = 3;

env = ASR;
ASR = en.asr(a,s,r,t);
a = 3;
s = 1;
r = 2;
t = gate;

gate = hslider("[1]Modulation Type 3[acc:1 0 -10 0 10]", 0,0,1,1);
