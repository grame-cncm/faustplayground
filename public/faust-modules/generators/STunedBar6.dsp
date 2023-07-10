declare name "Tuned Bar";
declare description "Nonlinear Banded Waveguide Models";
declare name "Six Rack Tuned Bars";
declare author "ER";//From "Tuned Bar" by Romain Michon (rmichon@ccrma.stanford.edu);


/* =========== DESCRIPTION =============

- Six rack tuned bars
- Head = Silence/Resonance
- Tilt = High frequencies 
- Front = High + Medium frequencies
- Bottom = High + Medium + Low frequencies

*/
 
import("stdfaust.lib");
instrument = library("instruments.lib");

//==================== INSTRUMENT =======================

process = vgroup("tunedBars",hgroup("[1]",par(i, 6, onerack(i,i,i))):>_);

onerack(h,n,e) = hgroup("Bar %n", par(i, 5, tunedBar(h,i,e)));

tunedBar(h,n,e) =
		((select-1)*-1) <:
		//nModes resonances with nModes feedbacks for bow table look-up 
		par(i,nModes,(resonance(i,freqqy(n,e),gate(h,n))~_)) :> + : 
		//Signal Scaling and stereo
		*(4);

//==================== GUI SPECIFICATION ================

gain = 0.8;
gate(h,n) = position(h,n) : upfront;
hand(0) = vslider("Instrument Hand[acc:1 0 -10 0 18]", 0, 0, 5, 1):int:ba.automat(120, 15, 0.0);
hand(1) = vslider("Instrument Hand[acc:1 0 -10 0 18]", 0, 0, 5, 1):int:ba.automat(120, 15, 0.0);
hand(2) = vslider("Instrument Hand[acc:1 0 -10 0 14]", 2, 0, 5, 1):int:ba.automat(240, 15, 0.0);
hand(3) = vslider("Instrument Hand[acc:1 0 -10 0 14]", 2, 0, 5, 1):int:ba.automat(240, 15, 0.0);
hand(4) = vslider("Instrument Hand[acc:1 0 -10 0 10]", 4, 0, 5, 1):int:ba.automat(480, 15, 0.0);
hand(5) = vslider("Instrument Hand[acc:1 0 -10 0 10]", 4, 0, 5, 1):int:ba.automat(480, 15, 0.0);

position(h,n) = abs(hand(h) - n) < 0.5;
upfront(x) = x>x';

select = 1;
integrationConstant = 0;
baseGain = 1;

//----------------------- Frequency Table --------------------

freq(0) = 92.49;
freq(1) = 103.82;
freq(2) = 116.54;
freq(3) = 138.59;
freq(4) = 155.56;

freq(d)	 = freq(d-5)*2;
freqqy(d,e) = freq(d+e*5);
//==================== MODAL PARAMETERS ================

preset = 2;

nMode(2) = 4;

modes(2,0) = 1;
basegains(2,0) = pow(0.999,1);
excitation(2,0,g) = 1*gain*g/nMode(2);

modes(2,1) = 4.0198391420;
basegains(2,1) = pow(0.999,2);
excitation(2,1,g) = 1*gain*g/nMode(2);

modes(2,2) = 10.7184986595;
basegains(2,2) = pow(0.999,3);
excitation(2,2,g) = 1*gain*g/nMode(2);

modes(2,3) = 18.0697050938;
basegains(2,3) = pow(0.999,4);
excitation(2,3,g) = 1*gain*g/nMode(2);

//==================== SIGNAL PROCESSING ================

//----------------------- Nonlinear filter ----------------------------
//nonlinearities are created by the nonlinear passive allpass ladder filter declared in filter.lib

//nonlinear filter order
nlfOrder = 6; 

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//the number of modes depends on the preset being used
nModes = nMode(preset);

delayLengthBase(f) = ma.SR/f;

//delay lengths in number of samples
delayLength(x,f) = delayLengthBase(f)/modes(preset,x);

//delay lines
delayLine(x,f) = de.delay(4096,delayLength(x,f));

//Filter bank: fi.bandpass filters (declared in instrument.lib)
radius = 1 - ma.PI*32/ma.SR;
bandPassFilter(x,f) = instrument.bandPass(f*modes(preset,x),radius);

//----------------------- Algorithm implementation ----------------------------

//One resonance
resonance(x,f,g) = + : + (excitation(preset,x,g)*select) : delayLine(x,f) : *(basegains(preset,x)) : bandPassFilter(x,f);

