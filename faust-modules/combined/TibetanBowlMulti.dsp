declare name "Tibetan Bowl";
declare description "Banded Waveguide Modeld Tibetan Bowl";
declare author "Romain Michon";
declare copyright "Romain Michon (rmichon@ccrma.stanford.edu)";
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
declare description "This instrument uses banded waveguide. For more information, see Essl, G. and Cook, P. Banded Waveguides: Towards Physical Modelling of Bar Percussion Instruments, Proceedings of the 1999 International Computer Music Conference.";

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* ============ DESCRIPTION ==============

- Multiple Tibetan Bowls
- Head = Note Still/Reverberation
- Head + Light circling on the spot/slight rotation = reverberated rolling ball in the bowl
- Rocking = Ringing all bowls from low to high frequencies
- Back = Modulation
- Back + Light circling on the spot/slight rotation = rolling ball in the bowl

*/

//==================== INSTRUMENT =======================

process =
		(((select-1)*-1) <:
		//nModes resonances with nModes feedbacks for bow table look-up
		par(i,nModes,(resonance(i)~_))):>+://~par(i,nModes,_) :> + :
		//Signal Scaling and stereo
		NLFM : stereo : instrReverbAccel:
		*(vol),*(vol);

//==================== GUI SPECIFICATION ================

vol = 0.8;
freq = hslider("[1]Frequency[unit:Hz][acc:0 1 -10 0 10]", 440,180,780,1);
gain = 0.5;
gate = 0;
select = hslider("[0]Play[tooltip:0=Bow; 1=Strike][acc:2 1 -10 0 10]", 0,0,1,1);
integrationConstant = 0.01;
baseGain = 0.5;
typeModulation = 3;

nonLinearity = hslider("[2]Modulation[acc:2 0 -10 0 15][tooltip:Nonlinearity factor (value between 0 and 1)]",0.02,0,0.1,0.001);
frequencyMod = hslider("[3]Modulation Frequency[3][unit:Hz][acc:2 0 -10 0 15]", 220,150,500,0.1);
nonLinAttack = 0.1;
//==================== MODAL PARAMETERS ================

preset = 0;

nMode(0) = 12;

modes(0,0) = 0.996108344;
basegains(0,0) = 0.999925960128219;
excitation(0,0) = 11.900357 / 10;

modes(0,1) = 1.0038916562;
basegains(0,1) = 0.999925960128219;
excitation(0,1) = 11.900357 / 10;

modes(0,2) = 2.979178;
basegains(0,2) = 0.999982774366897;
excitation(0,2) = 10.914886 / 10;

modes(0,3) = 2.99329767;
basegains(0,3) = 0.999982774366897;
excitation(0,3) = 10.914886 / 10;

modes(0,4) = 5.704452;
basegains(0,4) = 1.0;
excitation(0,4) = 42.995041 / 10;

modes(0,5) = 5.704452;
basegains(0,5) = 1.0;
excitation(0,5) = 42.995041 / 10;

modes(0,6) = 8.9982;
basegains(0,6) = 1.0;
excitation(0,6) = 40.063034 / 10;

modes(0,7) = 9.01549726;
basegains(0,7) = 1.0;
excitation(0,7) = 40.063034 / 10;

modes(0,8) = 12.83303;
basegains(0,8) = 0.999965497558225;
excitation(0,8) = 7.063034 / 10;

modes(0,9) = 12.807382;
basegains(0,9) = 0.999965497558225;
excitation(0,9) = 7.063034 / 10;

modes(0,10) = 17.2808219;
basegains(0,10) = 0.9999999999999999999965497558225;
excitation(0,10) = 57.063034 / 10;

modes(0,11) = 21.97602739726;
basegains(0,11) = 0.999999999999999965497558225;
excitation(0,11) = 57.063034 / 10;

//==================== SIGNAL PROCESSING ================

//----------------------- Nonlinear filter ----------------------------
//nonlinearities are created by the nonlinear passive allpass ladder filter declared in filter.lib

//nonlinear filter order
nlfOrder = 6;

//nonLinearModultor is declared in instrument.lib, it adapts allpassnn from filter.lib
//for using it with waveguide instruments
NLFM =  instrument.nonLinearModulator((nonLinearity : si.smooth(0.999)),1,freq,
typeModulation,(frequencyMod : si.smooth(0.999)),nlfOrder);

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//the number of modes depends on the preset being used
nModes = nMode(preset);

//bow table parameters
tableOffset = 0;
tableSlope = 10 - (9*bowPressure);

delayLengthBase = ma.SR/freq;

//de.delay lengths in number of samples
delayLength(x) = delayLengthBase/modes(preset,x);

//de.delay lines
delayLine(x) = de.delay(4096,delayLength(x));

//Filter bank: fi.bandpass filters (declared in instrument.lib)
radius = 1 - ma.PI*32/ma.SR;
bandPassFilter(x) = instrument.bandPass(freq*modes(preset,x),radius);

//Delay lines feedback for bow table lookup control
baseGainApp = 0.8999999999999999 + (0.1*baseGain);
velocityInputApp = integrationConstant;
velocityInput = velocityInputApp + _*baseGainApp,par(i,(nModes-1),(_*baseGainApp)) :> +;

//Bow velocity is controled by an ADSR envelope
maxVelocity = 0.03 + 0.1*gain;
bowVelocity = maxVelocity*en.adsr(0.02,0.005,0.9,0.01,gate);

stereoo(periodDuration) = _ <: _,widthdelay : stereopanner
	   with{
		//W = hslider("v:Spat/spatial width", 0.5, 0, 1, 0.01);
		W = 0.5;
		//A = hslider("v:Spat/pan angle", 0.6, 0, 1, 0.01);
		A = 0.6;
		widthdelay = de.delay(4096,W*periodDuration/2);
		stereopanner = _,_ : *(1.0-A), *(A);
	   };
stereo = stereoo(delayLengthBase);

//----------------------- Algorithm implementation ----------------------------

//One resonance
resonance(x) = + : + (excitation(preset,x)*select) : delayLine(x) : *(basegains(preset,x)) : bandPassFilter(x);

//----------------------- Reverb (ajout accelerometre 05/2015) ----------------

instrReverbAccel = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) :
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("v:[4]Reverb/[1]Reverberation Volume (InstrReverb)[acc:1 1 -10 0 10]",0.2,0.02,1,0.01) : si.smooth(0.999):min(1):max(0.02);
       roomSize = hslider("v:[4]Reverb/[2]Reverberation Room Size (InstrReverb)[acc:1 1 -10 0 10]", 0.2,0.02,1.3,0.01) : min(1.3) :  max(0.02);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };
