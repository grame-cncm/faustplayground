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

process = par(i, N, NFLeks(i)):>_;

NFLeks(n) = filtered_excitation(n,P(freq(n)),freq(n)) : stringloop(freq(n));
 
//==================== GUI SPECIFICATION ================

N = 20;
hand = hslider("[1]Instrument Hand[acc:0 1 -10 0 10]", 10, 0, N, 1) : ba.automat(bps, 15, 0.0)// => gate
with{
bps = hslider("[2]Speed[style:knob][acc:0 1 -10 0 10]", 480, 180, 720, 1):si.smooth(0.999) : min(720) : max(180) : int;
};
gain = 1;
pickangle  = 0.81;

beta = 0.5;
t60 = hslider("[3]Resonance[unit:s][acc:2 1 -10 0 10]", 5, 0.5, 10, 0.01);  // -60db decay time (sec)

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

P(f) = ma.SR/f ; // fundamental period in samples
Pmax = 4096; // maximum P (for delay-line allocation)

ppdel(f) = beta*P(f); // pick position delay
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

