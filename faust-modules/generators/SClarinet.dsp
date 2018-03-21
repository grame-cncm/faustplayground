declare name "Clarinet";
declare description "Nonlinear WaveGuide Clarinet";
declare author "Romain Michon";
declare copyright "Romain Michon (rmichon@ccrma.stanford.edu)";
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
declare description "A simple clarinet physical model, as discussed by Smith (1986), McIntyre, Schumacher, Woodhouse (1983), and others.";
declare reference "https://ccrma.stanford.edu/~jos/pasp/Woodwinds.html";

//Modification Grame July 2015

import("stdfaust.lib");
instrument = library("instruments.lib");

/* =============== DESCRIPTION ================= :

- Clarinet responding to vigorous gestures
- Turn ON clarinet (0=OFF, 1=ON)
- Head = High frequencies/Silence when hold still
- Tilt = very soft sound
- Bottom = Low frequencies
- Right = Breathy clarinet
- Fishing rod (vigorous mouvements) :
 ==> Downward = to reach lower frequencies
 ==> Upward = To 'through' the sound in the air = vanishes, comes back when Tilt
- Rocking = from full sound to breathy sound
- Shaking in right position = no.noise impulses

*/

//==================== INSTRUMENT =======================

process = vgroup("CLARINET",
	//Commuted Loss Filtering
	(_,(breathPressure <: _,_) : (filter*-0.95 - _ <: 
	
	//Non-Linear Scattering
	*(reedTable)) + _) ~ 
	
	//Delay with Feedback
	(delayLine):// : NLFM) : 
	
	//scaling and stereo
	*(gain)*1.5); 
	
//==================== GUI SPECIFICATION ================


freq = hslider("h:[2]Instrument/Frequency[unit:Hz][tooltip:Tone frequency][acc:1 1 -14 0 10]", 440,110,1300,0.01):si.smooth(0.999);
gain = 1;
gate = hslider("[1]ON/OFF",0,0,1,1);

reedStiffness = hslider("h:[3]Parameters/Instrument Stiffness[style:knob][acc:0 1 -12 0 12]", 0.25,0.01,1,0.01);
noiseGain = hslider("h:[3]Parameters/Breath Noise[style:knob][acc:0 1 -10 0 12]", 0.02,0,0.12,0.01);
pressure = hslider("h:[3]Parameters/ Pressure[style:knob][acc:1 0 -10 0 10]", 0.8,0.25,1,0.01);

vibratoFreq = 5;
vibratoGain = 0.1;
vibratoAttack = 0.5;
vibratoRelease = 0.01;

envelopeAttack = 0.1;
envelopeDecay = 0.05;
envelopeRelease = 0.1;

//==================== SIGNAL PROCESSING ======================

//----------------------- Synthesis PARAMETERS computing and functions declaration ----------------------------

//reed table PARAMETERS
reedTableOffset = 0.7;
reedTableSlope = -0.44 + (0.26*reedStiffness);

//the reed function is declared in INSTRUMENT.lib
reedTable = instrument.reed(reedTableOffset,reedTableSlope);

//delay line with a length adapted in function of the order of nonlinear filter
delayLength = ma.SR/freq*0.5 - 1.5;// - (nlfOrder*nonLinearity)*(typeModulation < 2);
delayLine = de.fdelay(4096,delayLength);

//one zero filter used as a allpass: pole is set to -1
filter = instrument.oneZero0(0.5,0.5);

//stereoizer is declared in INSTRUMENT.lib and implement a stereo spacialisation in function of 
//the frequency period in number of samples 
//stereo = stereoizerCla(ma.SR/freq);

//----------------------- Algorithm implementation ----------------------------

//Breath pressure + vibrato + breath no.noise + envelope (Attack / Decay / Sustain / Release)
envelope = en.adsr(envelopeAttack,envelopeDecay,1,envelopeRelease,gate)*pressure*0.9;

vibrato = os.osc(vibratoFreq)*vibratoGain*
	instrument.envVibrato(0.1*2*vibratoAttack,0.9*2*vibratoAttack,100,vibratoRelease,gate);
breath = envelope + envelope*no.noise*noiseGain;
breathPressure = breath + breath*vibrato;





