declare name "Modulations";

/* =========== DESCRITPION ===========

- Non Linear modulation processor
- There are 5 different types of modulations available :
==> 0, 1, 2 use the incoming signal to perform the modulation
==> 3 uses the modulating frequency to modulate the sound
==> 4 uses the default 220Hz frequency to modulate the sound

- Pick a modulation type
- Left/Right/Back = modulated sound
- Front = No modulation
- Head = minimum modulation intensity/ High modulating frequency
- Bottom = maximum modulation intensity/ Low modulating frequency
- Swing = change modulation intensity and modulating frequency

*/

import("stdfaust.lib");
instrument=library("instruments.lib");

NLFM = _ : instrument.nonLinearModulator(nonlinearity,env,freq,typeMod,freqMod,order) : _;
process = NLFM;

gate = hslider("[1]ON/OFF (ASR Envelope)[acc:2 0 -10 0 10]", 1,0,1,1);

ASR =(en.asr(a,s,r,t))
	with {
		a = 1;
		s = 1;
		r = 1;
		t = gate;
		};

nonlinearity = hslider("[4]Modulation Intensity[acc:1 0 -10 0 10][style:knob]", 0.1, 0, 1, 0.001);
env = ASR;
freq = 220;
typeMod = hslider("[2]Modulation Type[style:radio{'0':0;'1':1;'2':2;'3':3;'4':4}]", 0, 0, 4, 1);
freqMod = hslider("[3]Modulating Frequency[acc:1 1 -10 0 10][style:knob][unit:Hz]", 204.8, 50, 1700, 0.1):si.smooth(0.999);
order = nlfOrder;
nlfOrder = 6;
