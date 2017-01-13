declare name "Tinkle";
declare description "Banded Waveguide Modeld Tibetan Bowl";
declare author "Romain Michon";
declare copyright "Romain Michon (rmichon@ccrma.stanford.edu)";
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
declare description "This instrument uses banded waveguide. For more information, see Essl, G. and Cook, P. Banded Waveguides: Towards Physical Modelling of Bar Percussion Instruments, Proceedings of the 1999 International Computer Music Conference.";

/* ============ DESCRIPTION ==============

- Tinkling bowls
- Rocking = Ringing all bowls from low to high frequencies

*/

import("stdfaust.lib");
instrument = library("instruments.lib");

//==================== INSTRUMENT =======================

process = hgroup("Tinkle",(((select-1)*-1) <:
		//nModes resonances with nModes feedbacks for bow table look-up 
		par(i,nModes,(resonance(i)~_))):>+:fi.lowpass(1,5000)*(gain));

//==================== GUI SPECIFICATION ================

freq = hslider("[1]Frequency[unit:Hz][acc:0 1 -10 0 10]", 440,180,780,1);
gain = 0.7; 
gate = 0;
select = hslider("[2]Play[style:knob][tooltip:0=Bow; 1=Strike][acc:1 0 -10 0 10]", 1,0,1,1);
integrationConstant = 0.01;
baseGain = 0.5;

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

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//the number of modes depends on the preset being used
nModes = nMode(preset);

delayLengthBase = ma.SR/freq;

//delay lengths in number of samples
delayLength(x) = delayLengthBase/modes(preset,x);

//delay lines
delayLine(x) = de.delay(4096,delayLength(x));

//Filter bank: fi.bandpass filters (declared in instrument.lib)
radius = 1 - ma.PI*32/ma.SR;
bandPassFilter(x) = instrument.bandPass(freq*modes(preset,x),radius);

//----------------------- Algorithm implementation ----------------------------

//One resonance
resonance(x) = + : + (excitation(preset,x)*select) : delayLine(x) : *(basegains(preset,x)) : bandPassFilter(x);
