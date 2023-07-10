declare name "C Major Flute";
declare author "ER";// Adapted from  "Nonlinear WaveGuide Flute" by Romain Michon (rmichon@ccrma.stanford.edu)";

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =============== DESCRIPTION ================= :

- C Major flute
- Rocking = playing all notes from low to high frequencies
- Left = Silence/Slow rhythm
- Right = Fast rhythm
- Head = Reverberation
- Front = long notes
- Back = short notes

*/

//==================== INSTRUMENT =======================

flute(n) = (_ <: (flow(trigger(n)) + *(feedBack1) : embouchureDelay(freq(n)): poly) + *(feedBack2) : reflexionFilter)~(boreDelay(freq(n))) : *(env2(trigger(n)))*gain:_;

process = vgroup("C Maj Flute", par(i, N, flute(i)):>_<: instrReverbFlute);

//==================== GUI SPECIFICATION ================
vibratoFreq = 2.5;
env1Attack = 0.06;
env1Release = 1;

//-------------------- Non-Variable Parameters -----------
N = 17;

gain = 1;
pressure = 0.9;
breathAmp = 0.01;
vibratoGain = 0.1;
vibratoBegin = 0.1;
vibratoAttack = 0.1;
vibratoRelease = 0.2;
pressureEnvelope = 0;
env1Decay = 0.2;
env2Attack = 0.1;
env2Release = 0.1;

//----------------------- Frequency Table --------------------

freq(0) = 261.62;
freq(1) = 293.66;
freq(2) = 329.62;
freq(3) = 349.22;
freq(4) = 391.99;
freq(5) = 440.00;
freq(6) = 493.88;

freq(d)	 = freq(d-7)*2;

//==================== SIGNAL PROCESSING ================

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//Loops feedbacks gains
feedBack1 = 0.4;
feedBack2 = 0.4;

//Delay Lines
embouchureDelayLength(f) = (ma.SR/f)/2-2;
boreDelayLength(f) = ma.SR/f-2;
embouchureDelay(f) = de.fdelay(4096,embouchureDelayLength(f));
boreDelay(f) = de.fdelay(4096,boreDelayLength(f));

//Polinomial
poly = _ <: _ - _*_*_;

//jet filter is a lowwpass filter (declared in filter.lib)
reflexionFilter = fi.lowpass(1,2000);

//----------------------- Algorithm implementation ----------------------------

//Pressure envelope
env1(t) = en.adsr(env1Attack,env1Decay,0.9,env1Release,(t | pressureEnvelope))*pressure*1.1; 

//Global envelope
env2(t) = en.asr(env2Attack,1,env2Release,t)*0.5;

//Vibrato Envelope
vibratoEnvelope(t) = instrument.envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,t)*vibratoGain; 

vibrato(t) = os.osc(vibratoFreq)*vibratoEnvelope(t);

breath(t) = no.noise*env1(t);

flow(t) = env1(t) + breath(t)*breathAmp + vibrato(t);

//------------------------- Enveloppe Trigger --------------------------------------------

trigger(n) = position(n): trig
	with{
	upfront(x) 	= (x-x') > 0;
	decay(n,x)	= x - (x>0.0)/n;
	release(n)	= + ~ decay(n);
	noteDuration = hslider("h:[1]/[3]Note Duration[unit:s][style:knob][acc:2 1 -10 0 10]", 0.166, 0.1, 0.25, 0.01)*44100 : min(11025) : max(4410):int;
	trig = upfront : release(noteDuration) : >(0.0);
	};

position(n) = abs(hand - n) < 0.5;
hand = hslider("h:[1]/[1]Instrument Hand[acc:0 1 -12 0 10]", 9, 0, N, 1): ba.automat(bps, 15, 0.0)// => gate
    with {
		bps = hslider("h:[1]/[2]Speed[style:knob][acc:0 1 -10 0 10]", 480, 180, 720, 1):si.smooth(0.999) : min(720) : max(180) : int;
    };
//----------------------- INSTRREVERB ----------------------------
// GUI for re.zita_rev1_stereo from effect.lib
//
// USAGE:
//  _,_ : instrRerveb

instrReverbFlute = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) : 
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("h:[2]Reverb/[1]Reverberation Volume (InstrReverb)[style:knob][acc:1 1 -10 0 10]", 0.2,0.05,1,0.01):si.smooth(0.999):min(1):max(0.05);
       roomSize = hslider("h:[2]Reverb/[2]Reverberation Room Size (InstrReverb)[style:knob][acc:1 1 -10 0 10]", 0.5,0.05,2,0.01):min(2):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };


