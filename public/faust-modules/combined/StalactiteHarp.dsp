declare name "Stalactite Harp";
declare author "ER"; //From Non-linear EKS by Julius Smith and Romain Michon;

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =============== DESCRIPTION ================= :

- Stalactite harp mimicking the sound of drops of water in a cave
- Head = Reverberation
- Left = Rare drops
- Right = Frequent and rapidly falling drops
- Back = Harp/Silence

*/

//==================== INSTRUMENT =======================

process = vgroup("Stalactite Harp",par(i, N, NFLeks(i)):>_<: instrReverbHarp);

NFLeks(n) = filtered_excitation(n+1,P(freq(n)),freq(n)) : stringloop(freq(n)) : fi.lowpass(1,8000);
 
//==================== GUI SPECIFICATION ================

N = 14;
hand = hslider("[1]Instrument Hand[acc:2 1 -10 0 10]", 8, 0, N, 1) : ba.automat(360, 15, 0.0);// => gate
gain = 1;

pickangle  = 0.81;

beta = 0.5;
t60 = hslider("h:[3]Reverb/[1]Resonance (InstrReverb)[style:knob][acc:0 1 -10 0 10]", 5, 0.5, 10, 0.01):min(10):max(0.5);  // -60db decay time (sec)

B = 0;
L = -10 : ba.db2linear;

//---------------------------------- FREQUENCY TABLE ---------------------------

freq(0) = 1108.73;
freq(1) = 1244.50;
freq(2) = 1479.97;
freq(3) = 1661.21;
freq(4) = 1864.65;

freq(d)	 = freq(d-5)*2;

//==================== SIGNAL PROCESSING ================

//----------------------- noiseburst -------------------------
// White no.noise burst (adapted from Faust's karplus.dsp example)
// Requires music.lib (for no.noise)

noiseburst(d,e) = no.noise : *(trigger(d,e))
    with {
        upfront(x) = (x-x') > 0;
        decay(n,x) = x - (x>0)/n;
        release(n) = + ~ decay(n);
        position(d) = abs(hand - d) < 0.5;
        trigger(d,n) = select2(position(d),0,pulsaxo.gate) : upfront : release(n) : > (0.0);
    };

pulsaxo = environment{

gate = phasor_bin(1) :-(0.001):pulsar;
ratio_env = (0.5);
fade = (0.5); // min > 0 pour eviter division par 0
speed = hslider ("h:[2]Pulse/[1]Speed (Granulator)[unit:Hz][style:knob][acc:0 1 -15 0 8]", 2,0.1,10,0.0001):fi.lowpass(1,1);
proba = hslider ("h:[2]Pulse/[2]Probability (Granulator)[unit:%][style:knob][acc:2 0 -15 0 10]", 95,20,100,1) * (0.01) : fi.lowpass(1,1);

phasor_bin (init) =  (+(float(speed)/float(ma.SR)) : fmod(_,1.0)) ~ *(init);
pulsar = _<:(((_)<(ratio_env)):@(100))*((proba)>((_),(no.noise:abs):ba.latch)); 

};

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

stringloop(f) = (+ : de.fdelay4(Pmax, P(f)-2)) ~ (loopfilter(f));// : NLFM(f));

instrReverbHarp = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) : 
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("h:[3]Reverb/[2]Reverberation Volume (InstrReverb)[style:knob][acc:1 1 -30 0 13]", 0.2,0.05,1,0.01) : si.smooth(0.999):min(1):max(0.05);
       roomSize = hslider("h:[3]Reverb/[3]Reverberation Room Size (InstrReverb)[style:knob][acc:1 1 -30 0 13]", 0.72,0.05,1.7,0.01):min(1.7):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };

