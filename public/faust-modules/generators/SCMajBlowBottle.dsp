declare name "C Maj BlowBottle";
declare author "ER";//Adapted from Blow Bottle by Romain Michon (rmichon@ccrma.stanford.edu);

/* =========== DESCRITPION =============

- C Major Blow Bottles
- Left = Low frequencies/ Silence/ Slow rhythm
- Right = High frequencies/ Fast rhythm
- Front = Long notes
- Back = Short notes

*/

import("stdfaust.lib");
instrument = library("instruments.lib");

//==================== INSTRUMENT =======================

process = vgroup("Blowhistle Bottles", par(i, N, blow(i)) :>*(2));
blow(n)= 
	//differential pressure
	(-(breathPressure(trigger(n))) <: 
	((+(1))*randPressure((trigger(n))) : +(breathPressure(trigger(n)))) - *(instrument.jetTable),_ : baPaF(n),_)~_: !,_: 
	//signal scaling
	fi.dcblocker*envelopeG(trigger(n))*(0.5)
	with{
			baPaF(n) = bandPassFilter(freq(n));
			};

//==================== GUI SPECIFICATION ================
N = 16;

position(n) = abs(hand - n) < 0.5;
hand = hslider("[1]Instrument Hand[acc:0 1 -10 0 10]", 12, 0, N, 1) : si.smooth(0.999) : min(24) : max(0) :int: ba.automat(bps, 15, 0.0)
		with{
		bps = hslider("[2]Speed[style:knob][acc:0 1 -10 0 10]", 480, 180, 720, 1):si.smooth(0.999) : min(720) : max(180) : int;
		};
envelopeAttack = 0.01;
vibratoFreq = 5;
vibratoGain = 0.1;

//--------------------- Non-variable Parameters -------------

gain = 0.5;
noiseGain = 0.5;
pressure = 1.2;
vibratoBegin = 0.05;
vibratoAttack = 0.5;
vibratoRelease = 0.01;
envelopeDecay = 0.01;
envelopeRelease = 0.05;

//----------------------- Frequency Table --------------------

freq(0) = 130.81;
freq(1) = 146.83;
freq(2) = 164.81;
freq(3) = 174.61;
freq(4) = 195.99;
freq(5) = 220.00;
freq(6) = 246.94;
freq(d)	 = freq(d-7)*2;

//==================== SIGNAL PROCESSING ================

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//botlle radius
bottleRadius = 0.999;

bandPassFilter(f) = instrument.bandPass(f,bottleRadius);

//----------------------- Algorithm implementation ----------------------------

//global envelope is of type attack - decay - sustain - release
envelopeG(t) =  gain*en.adsr(gain*envelopeAttack,envelopeDecay,0.8,envelopeRelease,t);

//pressure envelope is also ADSR
envelope(t) = pressure*en.adsr(gain*0.02,0.01,0.8,gain*0.2,t);

//vibrato
vibrato(t) = os.osc(vibratoFreq)*vibratoGain*instrument.envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,t)*os.osc(vibratoFreq);

//breat pressure
breathPressure(t) = envelope(t) + vibrato(t);

//breath no.noise
randPressure(t) = noiseGain*no.noise*breathPressure(t) ;

//------------------------- Enveloppe Trigger --------------------------------------------

trigger(n) = position(n): trig
	with {
        upfront(x) 	= (x-x') > 0;
        decay(n,x)	= x - (x>0.0)/n;
        release(n)	= + ~ decay(n);
        noteDuration = hslider("[3]Note Duration[unit:s][style:knob][acc:2 1 -10 0 10]", 0.166, 0.1, 0.2, 0.01)*44100 : min(8820) : max(4410):int;
        trig = upfront : release(noteDuration) : >(0.0);
	};



 

	
