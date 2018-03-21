declare name "Brass";
declare description "WaveGuide Brass instrument from STK";
declare author "Romain Michon (rmichon@ccrma.stanford.edu)";
declare copyright "Romain Michon";
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
declare description "A simple brass instrument waveguide model, a la Cook (TBone, HosePlayer).";
declare reference "https://ccrma.stanford.edu/~jos/pasp/Brasses.html"; 

//Modification GRAME July 2015

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =============== DESCRIPTION ================= :
 
- Brass instrument
- Head = Reverb/Silence
- Upward = Higher frequency
- Downward = Lower frequency

*/

//==================== INSTRUMENT =======================

process = vgroup("Brass Instrument", Brass <: InstrReverBrass :>_);

Brass = (borePressure <: deltaPressure,_ : 
	  (lipFilter <: *(mouthPressure),(1-_)),_ : _, * :> + :
	  fi.dcblocker) ~ (boreDelay) :
	  *(gain)*(2);

//==================== GUI SPECIFICATION ================

freq = hslider("h:[1]Instrument/Frequency[1][unit:Hz] [tooltip:Tone frequency][acc:1 1 -10 0 10]", 300,170,700,1):si.smooth(0.999);
gain = 0.8;
gate = checkbox("h:[1]Instrument/ ON/OFF (ASR Envelope)");

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

//lips are simulated by a biquad filter whose output is squared and hard-clipped, instrument.bandPassH and instrument.saturationPos are declared in instrument.lib
lipFilterFrequency = freq*pow(4,(2*lipTension)-1);
lipFilter = *(0.03) : instrument.bandPassH(lipFilterFrequency,0.997) <: * : instrument.saturationPos;

//de.delay times in number of samples
slideTarget = ((ma.SR/freq)*2 + 3)*(0.5 + slideLength);
boreDelay = de.fdelay(4096,slideTarget);

//----------------------- Algorithm implementation ----------------------------

//vibrato
vibrato = vibratoGain*os.osc(vibratoFreq)*instrument.envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,gate);

//envelope (Attack / Decay / Sustain / Release), breath pressure and vibrato
breathPressure = pressure*en.adsr(envelopeAttack,envelopeDecay,1,envelopeRelease,gate) + vibrato;
mouthPressure = 0.3*breathPressure;

//scale the de.delay feedback
borePressure = *(0.85);

//differencial presure
deltaPressure = mouthPressure - _;

//-------------------------------- InstrReverb ---------------------------------

InstrReverBrass = re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       roomSize = hslider("v:[4]Reverb/Reverberation Room Size (InstrReverb)[acc:1 1 -15 0 12]", 0.2,0.05,1.7,0.01) : min(1.7) : max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };

