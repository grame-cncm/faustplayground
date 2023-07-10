declare name "Brass";
declare description "WaveGuide Brass instrument from STK";
declare author "Romain Michon (rmichon@ccrma.stanford.edu)";
declare copyright "Romain Michon";
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
//declare description "A simple brass instrument waveguide model, a la Cook (TBone, HosePlayer).";
declare reference "https://ccrma.stanford.edu/~jos/pasp/Brasses.html"; 

//Modification GRAME July 2015

/* =============== DESCRIPTION ================= :
 
- Brass instrument
- Turn ON brass (0=OFF, 1=ON)
- Head = Silence
- Upward = Higher frequency
- Downward = Lower frequency

*/

import("stdfaust.lib");
instrument=library("instruments.lib");

//==================== INSTRUMENT =======================

process = (borePressure <: deltaPressure,_ : 
	  (lipFilter <: *(mouthPressure),(1-_)),_ : _, * :> + :
	  fi.dcblocker) ~ (boreDelay) :
	  *(gain)*(2);

//==================== GUI SPECIFICATION ================

freq = hslider("h:[1]Instrument/Frequency[1][unit:Hz] [tooltip:Tone frequency][acc:1 1 -10 0 10]", 300,170,700,1):si.smooth(0.999);
gain = 0.8;
gate = hslider("h:[1]Instrument/ ON/OFF",0,0,1,1);

lipTension = 0.780;
pressure = 1;
slideLength = 0.041;

vibratoFreq = hslider("v:[3]Parameters/h:/Vibrato Frequency (Vibrato Envelope)[unit:Hz][style:knob][unit:Hz][acc:0 1 -10 0 10]", 5,1,10,0.01);
vibratoGain = 0.05;
vibratoBegin = 0.05;
vibratoAttack = 0.5;
vibratoRelease = 0.1;          

envelopeDecay = 0.001;
envelopeAttack = 0.005;
envelopeRelease = 0.07;
//==================== SIGNAL PROCESSING ================


//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//lips are simulated by a biquad filter whose output is squared and hard-clipped, bandPassH and saturationPos are declared in instrument.lib
lipFilterFrequency = freq*pow(4,(2*lipTension)-1);
lipFilter = *(0.03) : instrument.bandPassH(lipFilterFrequency,0.997) <: * : instrument.saturationPos;

//delay times in number of samples
slideTarget = ((ma.SR/freq)*2 + 3)*(0.5 + slideLength);
boreDelay = de.fdelay(4096,slideTarget);

//----------------------- Algorithm implementation ----------------------------

//vibrato
vibrato = vibratoGain*os.osc(vibratoFreq)*instrument.envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,gate);

//envelope (Attack / Decay / Sustain / Release), breath pressure and vibrato
breathPressure = pressure*en.adsr(envelopeAttack,envelopeDecay,1,envelopeRelease,gate) + vibrato;
mouthPressure = 0.3*breathPressure;

//scale the delay feedback
borePressure = *(0.85);

//differencial presure
deltaPressure = mouthPressure - _;

