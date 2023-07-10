declare name "Tuned Bars";
declare author "ER";//From "Tuned Bar" by Romain Michon (rmichon@ccrma.stanford.edu);

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =============== DESCRIPTION ================= :

- Cascading tuned bars
- Head = Reverberation / Silence
- Bottom = Chime
- Left = Low frequencies + slow rhythm
- Right = High frequencies + fast rhythm
- Reversed Fishing Rod = start at bottom or left or right and go rapidly up to head then down again
- Left/Bottom/Left = Low pitched chime
- Right/Bottom/Right = High pitched chime
- Back/Front/Geiger counter = Chime

*/


//==================== INSTRUMENT =======================

process = par(i, N, tunedBar(i)):>_<: drywet(_,echo) <: instrReverbChime : *(2),*(2);

tunedBar(n) =
		((select-1)*-1) <:
		//nModes resonances with nModes feedbacks for bow table look-up 
		par(i,nModes,(resonance(i,octave(n),gate(n))~_)):> + : 
		//Signal Scaling and stereo
		*(4);

//==================== GUI SPECIFICATION ================
N = 10;

gain = 1;
gate(n) = position(n) : upfront;
hand = hslider("[1]Instrument Hand[acc:1 0 -10 0 10]", 5, 0, N, 1):si.smooth(0.999):min(N):max(0):int:ba.automat(B, 15, 0.0);
B = hslider("[3]Speed[style:knob][acc:0 1 -10 0 10]", 360, 120, 720, 60): si.smooth(0.99) : min(720) : max(120) : int;
hight = hslider("[2]Hight[acc:0 1 -10 0 10]", 4, 0.5, 8, 0.1);//:si.smooth(0.999);
octave(d) = freq(d)*(hight);
position(n) = abs(hand - n) < 0.5;
upfront(x) = x>x';

select = 1;
//----------------------- Frequency Table --------------------


freq(0) = 130.81;
freq(1) = 146.83;
freq(2) = 164.81;
freq(3) = 184.99;
freq(4) = 207.65;
freq(5) = 233.08;

freq(d)	 = freq(d-6)*2;

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

//bow table parameters
tableOffset = 0;
tableSlope = 10 - (9*bowPressure);

delayLengthBase(f) = ma.SR/f;

//de.delay lengths in number of samples
delayLength(x,f) = delayLengthBase(f)/modes(preset,x);

//de.delay lines
delayLine(x,f) = de.delay(4096,delayLength(x,f));

//Filter bank: fi.bandpass filters (declared in instrument.lib)
radius = 1 - ma.PI*32/ma.SR;
bandPassFilter(x,f) = instrument.bandPass(f*modes(preset,x),radius);

//----------------------- Algorithm implementation ----------------------------

//One resonance
resonance(x,f,g) = + : + (excitation(preset,x,g)*select) : delayLine(x,f) : *(basegains(preset,x)) : bandPassFilter(x,f);

echo = +~(@(22050)*(feedback));
//feedback = hslider("Echo Intensity (Feedback)[acc:1 1 -5 0 12]", 0.1, 0.05, 0.65, 0.01):si.smooth(0.999):min(0.05):max(0.65);
feedback = 0.8;
drywet(x,y) 	= (1-c)*x + c*y
				with {
					c = hslider("[4]Echo Intensity[style:knob][unit:%][acc:1 1 -8 0 10]", 20,0,99,0.01)*(0.01):si.smooth(0.999):min(0.99):max(0.001);
					};
					
//instrReverb from instrument.lib
instrReverbChime = re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+       
    with {
       roomSize = hslider("h:[5]Reverb/Reverberation Room Size (InstrReverb)[style:knob][acc:1 1 -10 0 12]", 0.2,0.1,1.7,0.01):min(1.7):max(0.1);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };


