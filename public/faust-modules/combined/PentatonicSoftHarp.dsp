declare name "Pentatonic Soft Harp";
declare author "ER";//Adapted from "Nonlinear EKS" by Julius Smith and Romain Michon;


import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =============== DESCRIPTION ================= 

- Reverberated pentatonic soft harp
- Left = Lower frequencies/Silence when still
- Front = Resonance
- Back = No resonance
- Right = Higher frequencies/Fast rhythm
- Head = Reverberation
- Rocking = plucking all strings one by one

*/
//==================== INSTRUMENT =======================

process = par(i, N, NFLeks(i)):>_<: instrReverbHarp;

NFLeks(n) = filtered_excitation(n,P(freq(n)),freq(n)) : stringloop(freq(n));
 
//==================== GUI SPECIFICATION ================
// standard MIDI voice parameters:
// NOTE: The labels MUST be "freq", "gain", and "gate" for faust2pd

N = 20;
hand = hslider("[1]Instrument Hand[acc:0 1 -10 0 10]", 10, 0, N, 1) : ba.automat(bps, 15, 0.0)// => gate
with{
bps = hslider("[2]Speed[style:knob][acc:0 1 -10 0 10]", 480, 180, 720, 1):si.smooth(0.999) : min(720) : max(180) : int;
};
gain = 1;
pickangle  = 0.81;

beta = 0.5;
t60 = hslider("h:[3]Reverb/[1]Resonance[unit:s][acc:2 1 -10 0 10]", 5, 0.5, 10, 0.01);  // -60db decay time (sec)

B = 0;
 L = -10 : ba.db2linear;

//---------------------------------- FREQUENCY TABLE ---------------------------

freq(0) = 184.99;
freq(1) = 207.65;
freq(2) = 233.08;
freq(3) = 277.18;
freq(4) = 311.12;

freq(d)	 = freq(d-5)*2;

//==================== SIGNAL PROCESSING ================

//----------------------- noiseburst -------------------------
// White no.noise burst (adapted from Faust's karplus.dsp example)
// Requires music.lib (for no.noise)
noiseburst(d,e) = no.noise : *(trigger(d,e))
with{
upfront(x) = (x-x') > 0;
decay(n,x) = x - (x>0)/n;
release(n) = + ~ decay(n);
position(d) = abs(hand - d) < 0.5;
trigger(d,n) = position(d) : upfront : release(n) : > (0.0);
};

//nlfOrder = 6;
P(f) = ma.SR/f ; // fundamental period in samples
Pmax = 4096; // maximum P (for de.delay-line allocation)

ppdel(f) = beta*P(f); // pick position de.delay
pickposfilter(f) = fi.ffcombfilter(Pmax,ppdel(f),-1); // defined in filter.lib

excitation(d,e) = noiseburst(d,e) : *(gain); // defined in signal.lib

rho(f) = pow(0.001,1.0/(f*t60)); // multiplies loop-gain

// Original EKS damping filter:
b1 = 0.5*B; b0 = 1.0-b1; // S and 1-S
dampingfilter1(f,x) = rho(f) * ((b0 * x) + (b1 * x'));

// Linear phase FIR3 damping filter:
h0 = (1.0 + B)/2; h1 = (1.0 - B)/4;
dampingfilter2(f,x) = rho(f) * (h0 * x' + h1*(x+x''));

loopfilter(f) = dampingfilter2(f); // or dampingfilter1

filtered_excitation(d,e,f) = excitation(d,e) : si.smooth(pickangle) 
		    : pickposfilter(f) : fi.levelfilter(L,f); // see filter.lib

stringloop(f) = (+ : de.fdelay4(Pmax, P(f)-2)) ~ (loopfilter(f));

//================================= REVERB ==============================

instrReverbHarp = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) : 
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("h:[3]Reverb/[1]Reverberation Volume(InstrReverb)[style:knob][acc:1 1 -10 0 10]", 0.2,0.05,1,0.01):si.smooth(0.999):min(1):max(0.05);
       roomSize = hslider("h:[3]Reverb/[2]Reverberation Room Size (InstrReverb)[style:knob][acc:1 1 -10 0 10]", 0.2,0.05,1.7,0.01):min(1.3):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };

