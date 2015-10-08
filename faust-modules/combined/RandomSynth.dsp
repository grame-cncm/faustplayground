
declare name "Random Synth";
declare author "ER";//Adapted from Organ by Albert Graef;
declare version "1.0";

import("math.lib");
import("music.lib");
import("filter.lib");
import("effect.lib");

/* ========== DESCRIPTION =============

- Random frequency organ made from additive synthesis
- Head : note on hold/Reverberation
- Tilt : Slight vibrato/ sparse notes
- Left : Slow rhythm
- Right : Fast rhythm
- Front : Single oscillator playing
- Back : Three oscillators playing

*/

//=========================== INSTRUMENT ================================


partial(d) = amp(d) * osc(freq*(d+1)) * (0.3) <: _ , @(int(4410 *(d))) : drywet;

process	= vgroup("RANDOM SYNTH", hand <: sum(i, 3, partial(i))
  * (adsr(a,d,s,r,trig))
  * (gain) <:instrReverbSynth);

//=========================== PARAMETERS ================================

gain = hslider("v:[1]Instrument/[2]General Volume[acc:2 0 -10 0 10]", 0.5, 0.4, 1, 0.01):smooth(0.999):min(1):max(0);
// variable speed trigger:
hand = hslider("v:[1]Instrument/[1]Instrument Hand[acc:1 1 -10 0 10]", 10, 0, 20, 1) : automat(bps, 15, 0.0) : smooth(0.999) : min(20) : max(0) : int
with{
bps = hslider("v:[1]Instrument/[3]Speed[acc:0 0 -10 0 10]", 480, 180, 780, 1) : smooth(0.999) : min(780) : max(180) : int;
};

// relative amplitudes of the different partials
amp(0)	= 1;
amp(1)	= hslider("h:[3]Amplitudes/Oscillator 2[style:knob][acc:2 0 -10 0 10]", 0, 0, 1, 0.01):smooth(0.999):min(1):max(0);
amp(2)	= hslider("h:[3]Amplitudes/Oscillator 3[style:knob][acc:2 0 -10 0 10]", 0.25, 0, 1, 0.01):smooth(0.999):min(1):max(0);

//--------------------------- Envelope ----------------------------------

a = 0.01;
d = 0.01;
s = 99;
r = 0.7;

trig = upfront : release(envSize) : > (0.0)
with{
upfront(x) = abs(x-x')>0.5;
release(n) = + ~decay(n);
decay(n,x) = x - (x>0.0)/n;
envSize = hslider("h:[2]Envelope/Note Duration[style:knob][unit:s][acc:0 1 -10 0 10]", 0.3, 0.1, 0.6, 0.01) * (44100) : smooth(0.99):min(26460):max(4410):int;
};

//--------------------------- Random Frequency ---------------------------

freq = randfreq : smooth(0.99) : lowpass (1, 3000);
randfreq(g) = noise : sampleAndhold(sahgate(g))*(700)+(100)
with{
sampleAndhold(t) = select2(t) ~_;
sahgate(g) = g : upfront : counter -(3) <=(0);
upfront(x) = abs(x-x')>0.5;
counter(g) = (+(1):*(1-g))~_;
};

//--------------------------- Dry-Wet Mix -------------------------------
//Mixing undelayed sound with delayed sound

drywet(x,y) 	= (1-c)*x + c*y
				with {
					c = hslider("v:[4]Effects/[1]Echo Intensity[unit:%][acc:0 0 -10 0 8]", 0,0,100,0.01)*(0.01):smooth(0.999):min(1):max(0);
					};

//--------------------------- InstrReverb -------------------------------

instrReverbSynth = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) :
zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
       with{
       reverbGain = hslider("v:[4]Effects/[2]Reverberation Volume (InstrReverb)[acc:1 0 -10 0 10]",0.1,0.05,1,0.01) : smooth(0.999):min(1):max(0.05);
       roomSize = hslider("v:[4]Effects/[3]Reverberation Room Size(InstrReverb) [acc:1 0 -10 0 10]", 0.1,0.05,1,0.01):min(2):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
       };
