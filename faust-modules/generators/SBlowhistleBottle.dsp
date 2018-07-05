declare name "Blowhistle Bottle";
declare author "ER"; //From "Blow bottle" by Romain Michon;
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
declare description "This object implements a helmholtz resonator (biquad filter) with a polynomial jet excitation (a la Cook).";

/* =============== DESCRIPTION ================= :

- Blow bottles with whistling echo.
- Left : silence/dying echo.
- Front : single blow bottle.
- Back : maximum whistling echo
- Bottom : bottle + whistling echo 
- Rocking : changes tone of blow bottle. 

*/

import("stdfaust.lib");
instrument = library("instruments.lib");

//==================== INSTRUMENT =======================

process = vgroup("Blowhistle Bottles", par(i, N, blow(i)) :>_);

blow(n)= par(i, 2, 
	//differential pressure
	(-(breathPressure(trigger(n))) <: 
	((+(1))*randPressure((trigger(n))) : +(breathPressure(trigger(n)))) - *(instrument.jetTable),_ : baPaF(i,n),_)~_: !,_: 
	//signal scaling
	fi.dcblocker*envelopeG(trigger(n))*(0.5)<:+(voice(i,n))*resonGain(i)):>_
	with{
			baPaF(0,n) = bandPassFilter(freq(n));
			baPaF(1,n) = bandPassFilter(freq(n)*8);
			voice(0,n) = 0*n;
			voice(1,n) = 1*(fi.resonbp(freq(n)*8,Q,gain):echo);
			resonGain(0) = 1;
			resonGain(1) =(hslider("v:[1]Instrument/Whistle Volume[acc:2 0 -10 0 10]", 0.07, 0, 0.2, 0.001))^2:si.smooth(0.999);

			echo = _:+~(@(delayEcho):*(feedback));
			delayEcho = 44100;
			feedback = hslider("h:[2]Echo/Echo Intensity [style:knob][acc:2 0 -10 0 10]", 0.48, 0.2, 0.98, 0.01):si.smooth(0.999):min(0.98):max(0.2);
			};

//==================== GUI SPECIFICATION ================
N = 10;
Q = 30;
position(n) = abs(hand - n) < 0.5;
hand = hslider("v:[1]Instrument/Instrument Hand[acc:0 1 -10 0 10]", 5, 0, N, 1):int:ba.automat(360, 15, 0.0);
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
envelopeRelease = 0.5;

//----------------------- Frequency Table --------------------

freq(0) = 130.81;
freq(1) = 146.83;
freq(2) = 164.81;
freq(3) = 195.99;
freq(4) = 220.00;

freq(d)	 = freq(d-5)*2;

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
        trig = upfront : release(8820) : >(0.0);
	};


	
