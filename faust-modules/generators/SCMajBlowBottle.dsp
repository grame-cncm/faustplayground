declare name "C Maj BlowBottle";
declare author "ER";//Adapted from Blow Bottle by Romain Michon (rmichon@ccrma.stanford.edu);

/* =========== DESCRITPION =============

- C Major Blow Bottles
- Left = Low frequencies/ Silence/ Slow rhythm
- Right = High frequencies/ Fast rhythm
- Front = Long notes
- Back = Short notes

*/

import("math.lib");
import("music.lib");
import("instrument.lib");
import("filter.lib");

//==================== INSTRUMENT =======================

process = vgroup("Blowhistle Bottles", par(i, N, blow(i)) :>*(2));
blow(n)= 
	//differential pressure
	(-(breathPressure(trigger(n))) <: 
	((+(1))*randPressure((trigger(n))) : +(breathPressure(trigger(n)))) - *(jetTable),_ : baPaF(n),_)~_: !,_: 
	//signal scaling
	dcblocker*envelopeG(trigger(n))*(0.5)
	with{
			baPaF(n) = bandPassFilter(freq(n));
			};

//==================== GUI SPECIFICATION ================
N = 16;

position(n) = abs(hand - n) < 0.5;
hand = hslider("[1]Instrument Hand[acc:0 0 -10 0 10]", 12, 0, N, 1) : smooth(0.999) : min(24) : max(0) :int: automat(bps, 15, 0.0)
		with{
		bps = hslider("[2]Speed[style:knob][acc:0 0 -10 0 10]", 480, 180, 720, 1):smooth(0.999) : min(720) : max(180) : int;
		};
envelopeAttack = 0.01;
vibratoFreq = 5;
vibratoGain = 0.1;


//--------------------- Non-variable Parameters -------------

gain = 0.5;
noiseGain = 0.5;
pressure = 1;
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

bandPassFilter(f) = bandPass(f,bottleRadius);

//----------------------- Algorithm implementation ----------------------------

//global envelope is of type attack - decay - sustain - release
envelopeG(t) =  gain*adsr(gain*envelopeAttack,envelopeDecay,80,envelopeRelease,t);

//pressure envelope is also ADSR
envelope(t) = pressure*adsr(gain*0.02,0.01,80,gain*0.2,t);

//vibrato
vibrato(t) = osc(vibratoFreq)*vibratoGain*envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,t)*osc(vibratoFreq);

//breat pressure
breathPressure(t) = envelope(t) + vibrato(t);

//breath noise
randPressure(t) = noiseGain*noise*breathPressure(t) ;

//------------------------- Enveloppe Trigger --------------------------------------------

trigger(n) = position(n): trig
	with{
	upfront(x) 	= (x-x') > 0;
	decay(n,x)	= x - (x>0.0)/n;
	release(n)	= + ~ decay(n);
	noteDuration = hslider("[3]Note Duration[unit:s][style:knob][acc:2 0 -10 0 10]", 0.166, 0.1, 0.2, 0.01)*44100 : min(8820) : max(4410):int;
	trig = upfront : release(noteDuration) : >(0.0);
	};



 

	