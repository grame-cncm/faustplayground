declare name "Whistles";
declare author "ER";
declare version "1.0";

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* ============ Description ============== :

- 3 triple whistles, one per axis.
- Head = reverberation & whistles heard from far away.
- Bottom + rotation = proximity of the whistles.
- Rapid swings trigger volume increases (fishing rod/rocking/swing).

*/

//----------------- INSTRUMENT ------------------//

process = vgroup("Whistles", nOise.white * (0.5) <: par(f, 3, par(i, 3, whistle(f,i)) )):>_<: frEEvErb.fvb :>_;

whistle(f,n) =  BP(f,n) : EQ(f,n) :  @(10 + (12000*n)) <:Reson(f,0),_*(1.5):>  * (vibrato)  *(vibratoEnv(f))*(gain(f));

//----------------- NOISES ----------------------//

nOise = environment{

// white no.noise generator:
	random  = +(12345)~*(1103515245);
	white   = random/2147483647.0;

//pink no.noise filter:
	p	= f : (+ ~ g)
		with {
		f(x)	= 0.04957526213389*x - 0.06305581334498*x' + 0.01483220320740*x'';
		g(x)	= 1.80116083982126*x - 0.80257737639225*x';
		};

//pink no.noise generator:
	pink = (white : p);
	};

//----------------- FILTERS -------------------//

//gain = 1 - (Q * 0.1);

freq(0) = hslider("[1]Frequency 0[unit:Hz][acc:2 1 -10 0 10]", 110, 50, 220, 0.01):si.smooth(0.999);
freq(1) = hslider("[2]Frequency 1[unit:Hz][acc:2 1 -10 0 10]", 400, 220, 660, 0.01):si.smooth(0.999);
freq(2) = hslider("[3]Frequency 2[unit:Hz][acc:2 1 -10 0 10]", 820, 660, 1100, 0.01):si.smooth(0.999);

gain(n) = hslider("[5]Volume %n[style:knob][acc:%n 0 -10 0 20]", 0.2, 0, 2, 0.001):si.smooth(0.999);

hight(f,n) = freq(f)* (n+1);
level = 20;
Lowf(f,n) = hight(f,n) - Q;
Highf(f,n) = hight(f,n) + Q;

Q = 2 : si.smooth(0.999);//hslider("Q - Filter Bandwidth[style:knob][unit:Hz][tooltip: Band width = 2 * Frequency]",2.5,1,10,0.0001):si.smooth(0.999);

BP(f,n) = fi.bandpass(1, Lowf(f,n), Highf(f,n));
EQ(f,n) = fi.peak_eq(level,hight(f,n),Q) : fi.lowpass(1, 6000);
Reson(f,n) = fi.resonbp(hight(f,n),Q,1) : fi.lowpass(1,3000);

//----------------- VIBRATO --------------------//

vibrato = vibratoGain * os.osc(vibratoFreq) + (1-vibratoGain);
vibratoGain = 0.17;//hslider("Vibrato Volume[style:knob][acc:1 0 -10 0 10]", 0.1, 0.05, 0.5, 0.01) : si.smooth(0.999);
vibratoFreq = vfreq; //hslider("Vibrato Frequency[unit:Hz][acc:0 0 -10 0 12]", 5, 0, 10, 0.001) : si.smooth(0.999);

//--------------------------- Random Frequency ---------------------------

vfreq = pulsawhistle.gate : randfreq : si.smooth(0.99) : fi.lowpass (1, 3000);
randfreq(g) = no.noise : sampleAndhold(sahgate(g))*(10)
    with {
        sampleAndhold(t) = select2(t) ~_;
        sahgate(g) = g : upfront : counter -(3) <=(0);
        upfront(x) = abs(x-x')>0.5;
        counter(g) = (+(1):*(1-g))~_;
    };

//----------------------- Pulsar --------------------------------------


pulsawhistle = environment{

gate = phasor_bin(1) :-(0.001):pulsar;
ratio_env = (0.5);
fade = (0.5); // min > 0 pour eviter division par 0
speed = 0.5;
proba = 0.9; //hslider ("h:Pulse/Probability[unit:%][style:knob][acc:1 1 -10 0 10]", 88,75,100,1) *(0.01):fi.lowpass(1,1);

phasor_bin (init) =  (+(float(speed)/float(ma.SR)) : fmod(_,1.0)) ~ *(init);
pulsar = _<:(((_)<(ratio_env)):@(100))*((proba)>((_),(no.noise:abs):ba.latch));

};

//----------------------- Vibrato Envelope ----------------------------

vibratoEnv(n) = (instrument.envVibrato(b,a,s,r,t(n)))
	with {
		b = 0.25;
		a = 0.1;
		s = 100;
		r = 0.8;
		t(n) = hslider("[4]Envelope ON/OFF %n[acc:%n 0 -12 0 2]", 1, 0, 1, 1);
    };

//------------------------ Freeverb ------------------------------------

frEEvErb = environment{

// Freeverb
//---------

fvb = vgroup("[6]Freeverb", fxctrl(fixedgain, wetSlider, stereoReverb(combfeed, allpassfeed, dampSlider, stereospread)));

//======================================================
//
//                      Freeverb
//        Faster version using fixed delays (20% gain)
//
//======================================================

// Constant Parameters
//--------------------

fixedgain   = 0.015; //value of the gain of fxctrl
scalewet    = 3.0;
scaledry    = 2.0;
scaledamp   = 0.4;
scaleroom   = 0.28;
offsetroom  = 0.7;
initialroom = 0.5;
initialdamp = 0.5;
initialwet  = 1.0/scalewet;
initialdry  = 0;
initialwidth= 1.0;
initialmode = 0.0;
freezemode  = 0.5;
stereospread= 23;
allpassfeed = 0.5; //feedback of the delays used in allpass filters


// Filter Parameters
//------------------

combtuningL1    = 1116;
combtuningL2    = 1188;
combtuningL3    = 1277;
combtuningL4    = 1356;
combtuningL5    = 1422;
combtuningL6    = 1491;
combtuningL7    = 1557;
combtuningL8    = 1617;

allpasstuningL1 = 556;
allpasstuningL2 = 441;
allpasstuningL3 = 341;
allpasstuningL4 = 225;


// Control Sliders
//--------------------
// Damp : filters the high frequencies of the echoes (especially active for great values of RoomSize)
// RoomSize : size of the reverberation room
// Dry : original signal
// Wet : reverberated signal

//dampSlider      = hslider("Damp",0.5, 0, 1, 0.025)*scaledamp;

dampSlider 		= 0.7*scaledamp;
roomsizeSlider  = hslider("[7]Reverberation Room Size (Freeverb)[style:knob][acc:1 1 -10 0 13]", 0.5, 0.1, 0.9, 0.025) : si.smooth(0.999) : min(0.9) :max(0.1) *scaleroom + offsetroom;
wetSlider       = hslider("[6]Reverberation Intensity (Freeverb)[style:knob][acc:1 1 -10 0 15]", 0.3333, 0.1, 0.9, 0.025) : si.smooth(0.999) : min(0.9) :max(0.1);
combfeed        = roomsizeSlider;

// Comb and Allpass filters
//-------------------------

allpass(dt,fb) = (_,_ <: (*(fb),_:+:@(dt)), -) ~ _ : (!,_);

comb(dt, fb, damp) = (+:@(dt)) ~ (*(1-damp) : (+ ~ *(damp)) : *(fb));

// Reverb components
//------------------

monoReverb(fb1, fb2, damp, spread)
    = _ <:  comb(combtuningL1+spread, fb1, damp),
            comb(combtuningL2+spread, fb1, damp),
            comb(combtuningL3+spread, fb1, damp),
            comb(combtuningL4+spread, fb1, damp),
            comb(combtuningL5+spread, fb1, damp),
            comb(combtuningL6+spread, fb1, damp),
            comb(combtuningL7+spread, fb1, damp),
            comb(combtuningL8+spread, fb1, damp)
        +>
            allpass (allpasstuningL1+spread, fb2)
        :   allpass (allpasstuningL2+spread, fb2)
        :   allpass (allpasstuningL3+spread, fb2)
        :   allpass (allpasstuningL4+spread, fb2)
        ;

stereoReverb(fb1, fb2, damp, spread)
    = + <:  monoReverb(fb1, fb2, damp, 0), monoReverb(fb1, fb2, damp, spread);


// fxctrl : add an input gain and a wet-dry control to a stereo FX
//----------------------------------------------------------------

fxctrl(g,w,Fx) =  _,_ <: (*(g),*(g) : Fx : *(w),*(w)), *(1-w), *(1-w) +> _,_;

};
