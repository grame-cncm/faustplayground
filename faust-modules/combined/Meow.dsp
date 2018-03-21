declare name "Meow";
declare description "WaveGuide Brass instrument from STK";
declare author "ER"; //From Brass by Romain Michon (rmichon@ccrma.stanford.edu);

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =============== DESCRIPTION ================= :

- Triple brass mimicking mewing cats
- Left =  silence.
- Rocking from top Left to Front/Right : one cat mewing
- Rotation = two cats in turn
- Back/Front = Tutti

*/

//==================== INSTRUMENT =======================

process = vgroup("MEOW", par(i, 3, brass(i)) :> crybb);

brass(n) = (borePressure <: deltaPressure(pressure(n)),_ :
	  (lipFilter(freq(n)) <: *(mouthPressure(pressure(n))),(1-_)),_ : _, * :> + :
	  fi.dcblocker) ~ (boreDelay(freq(n)))
	  *(gain(n)): fi.lowpass((n+1),((n+1)*1500));

//==================== GUI SPECIFICATION ================

//gate = checkbox(" Play[1]");
gate = hslider(" ON/OFF", 0, 0, 1, 1):int;

freq(0) = hslider("h:Instrument/v:Frequencies/Frequency 1 [unit:Hz][acc:1 0 -10 0 10][tooltip:Tone frequency]",370,280,380, 0.01):si.smooth(0.999);
freq(1) = hslider("h:Instrument/v:Frequencies/Frequency 2 [unit:Hz][acc:0 0 -10 0 10][tooltip:Tone frequency]",440,380,550,0.01):si.smooth(0.999);
freq(2) = hslider("h:Instrument/v:Frequencies/Frequency 3 [unit:Hz][acc:2 1 -10 0 12][tooltip:Tone frequency]",587.32,550,700,0.01):si.smooth(0.999);

gain(0) = hslider("h:Instrument/v:Gain/Volume 1 [style:knob][acc:1 1 -12 0 12][tooltip:Gain (value between 0 and 1)]",0.5,0,1,0.01);
gain(1) = hslider("h:Instrument/v:Gain/Volume 2 [style:knob][acc:0 1 -12 0 12][tooltip:Gain (value between 0 and 1)]",0.5,0,1,0.01);
gain(2) = hslider("h:Instrument/v:Gain/Volume 3 [style:knob][acc:2 0 -12 0 10][tooltip:Gain (value between 0 and 1)]",0.5,0,0.5,0.01);

pressure(0) = 0.37;
pressure(1) = 0.68;
pressure(2) = 1.0;

lipTension = 0.780;

slideLength = 0.041;

vibratoFreq = 6;
vibratoGain = 0.05;
vibratoBegin = 0.05;
vibratoAttack = 0.5;
vibratoRelease = 0.1;

envelopeAttack = 0.01;
envelopeDecay = 0.001;
envelopeRelease = 2;
//==================== SIGNAL PROCESSING ================

crybb = ve.crybaby(wah) with {
   wah = hslider("Wah Wah[acc:0 0 -15 10 0]", 0.5,0,1,0.01) : ba.automat(360, 15, 0.0);
};

//--------- Synthesis parameters computing and functions declaration -----------

//lips are simulated by a biquad filter whose output is squared and hard-clipped, instrument.bandPassH and instrument.saturationPos are declared in instrument.lib
lipFilterFrequency(f) = f*pow(4,(2*lipTension)-1);
lipFilter(f) = *(0.03) : instrument.bandPassH(lipFilterFrequency(f),0.997) <: * : instrument.saturationPos;

//de.delay times in number of samples
slideTarget(f) = ((ma.SR/f)*2 + 3)*(0.5 + slideLength);
boreDelay(f) = de.fdelay(4096,slideTarget(f));

//----------------------- Algorithm implementation ----------------------------

//vibrato
vibrato = vibratoGain*os.osc(vibratoFreq)*instrument.envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,gate);

//envelope (Attack / Decay / Sustain / Release), breath pressure and vibrato
breathPressure(p) = p*en.adsr(envelopeAttack,envelopeDecay,1,envelopeRelease,gate) + vibrato;
mouthPressure(p) = 0.3*breathPressure(p);

//scale the de.delay feedback
borePressure = *(0.85);

//differencial presure
deltaPressure(p) = mouthPressure(p) - _;
