declare name "Three Rack Tuned Bars";
declare author "ER";//From "Tuned Bar" by Romain Michon (rmichon@ccrma.stanford.edu);


/* =========== DESCRIPTION =============

- Three rack tuned bars
- Head = Silence/Resonance
- Tilt = High frequencies 
- Front = High + Medium frequencies
- Bottom = High + Medium + Low frequencies

*/
 
import("stdfaust.lib");
instrument = library("instruments.lib");

//==================== INSTRUMENT =======================

process = vgroup("tunedBars",hgroup("[1]",par(i, 3, onerack(i,i,i))):>_);

onerack(d,n,e) = hgroup("bar %n", par(i, 5, tunedBar(d,i,e)));

tunedBar(d,n,e) =
		((select-1)*-1) <:
		//nModes resonances with nModes feedbacks for bow table look-up 
		par(i,nModes,(resonance(i,freqqy(n,e),gate(d,n))~_)):> + : 
		//Signal Scaling and stereo
		*(4); 


//==================== GUI SPECIFICATION ================

gain = 0.8;

gate(d,n) = position(d,n) : upfront;
position(d,n) = abs(hand(d) - n) < 0.5;
upfront(x) = x>x';
hand(0) = vslider("Instrument Hand 0 [acc:1 0 -10 0 14]", 0, 0, 5, 1):int:ba.automat(120, 15, 0.0);
hand(1) = vslider("Instrument Hand 1 [acc:1 0 -10 0 14]", 2, 0, 5, 1):int:ba.automat(240, 15, 0.0);
hand(2) = vslider("Instrument Hand 2 [acc:1 0 -10 0 10]", 4, 0, 5, 1):int:ba.automat(480, 15, 0.0);


select = 1;

//----------------------- Frequency Table --------------------


freq(0) = 184.99;
freq(1) = 207.65;
freq(2) = 233.08;
freq(3) = 277.18;
freq(4) = 311.12;

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

