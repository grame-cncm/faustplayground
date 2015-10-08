declare name "Solo Pulsaxophone";
declare author "ER"; //From Saxophone by Romain Michon;

/* =============== DESCRIPTION ================= :

- Pulsing saxophone
- Head = High frequencies
- Bottom  = Low frequencies
- Right = Fast
- Left = Slow
- Head to Right, Head to Left = interesting transitions

*/

import("music.lib");
import("instrument.lib");

//==================== INSTRUMENT =======================
      
       
process = vgroup("PULSAXO",
	(bodyFilter,breathPressure : instrumentBody) ~ 
	(delay1 : NLFM) : !,_);

//==================== GUI SPECIFICATION ================

freq = hslider("h:Instrument/Frequency[unit:Hz][acc:1 0 -12 0 10]", 110,80,880,1):smooth(0.9999):min(880):max(80);
gate = pulsaxo.gate;
	
pressure = 0.83;
reedStiffness = 0.53;
blowPosition = 0.43;
noiseGain = 0.0001;
typeModulation = 4;
nonLinearity = 0.36;
frequencyMod = 20;
nonLinAttack = 0.12;

vibratoFreq = hslider("h:Parameters/Vibrato Frequency[style:knob][unit:Hz][acc:0 0 -10 0 10]", 6,1,15,0.1):smooth(0.999);
vibratoGain = 0.2;
vibratoBegin = 0.05;
vibratoAttack = 0.03;
vibratoRelease = 0.1;

envelopeAttack = 0.58;
envelopeRelease = 0.1;
//==================== SIGNAL PROCESSING ================

//----------------------- Pulsar --------------------------------------


pulsaxo = environment{

gate = phasor_bin(1) :-(0.001):pulsar;
ratio_env = (0.5);
fade = (0.5); // min > 0 pour eviter division par 0
speed = hslider ("h:[2]Pulse/[1]Speed (Granulator)[unit:Hz][style:knob][acc:0 0 -10 0 10]", 4,0.001,7,0.0001):lowpass(1,1);
proba = hslider ("h:[2]Pulse/[2]Probability (Granulator)[unit:%][style:knob][acc:1 1 -10 0 10]", 88,75,100,1)*(0.01):lowpass(1,1);

phasor_bin (init) =  (+(float(speed)/float(SR)) : fmod(_,1.0)) ~ *(init);
pulsar = _<:(((_)<(ratio_env)):@(100))*((proba)>((_),(noise:abs):latch)); 

};

//----------------------- Nonlinear filter ----------------------------
//nonlinearities are created by the nonlinear passive allpass ladder filter declared in filter.lib

//nonlinear filter order
nlfOrder = 6; 

//attack - sustain - release envelope for nonlinearity (declared in instrument.lib)
envelopeMod = asr(nonLinAttack,100,envelopeRelease,gate);

//nonLinearModultor is declared in instrument.lib, it adapts allpassnn from filter.lib 
//for using it with waveguide instruments
NLFM =  nonLinearModulator((nonLinearity : smooth(0.999)),envelopeMod,freq,
     typeModulation,(frequencyMod : smooth(0.999)),nlfOrder);

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//reed table parameters
reedTableOffset = 0.7;
reedTableSlope = 0.1 + (0.4*reedStiffness);

//the reed function is declared in instrument.lib
reedTable = reed(reedTableOffset,reedTableSlope);

//Delay lines length in number of samples
fdel1 = (1-blowPosition) * (SR/freq - 3);
fdel2 = (SR/freq - 3)*blowPosition +1 ;

//Delay lines
delay1 = fdelay(4096,fdel1);
delay2 = fdelay(4096,fdel2);

//Breath pressure is controlled by an attack / sustain / release envelope (asr is declared in instrument.lib)
envelope = (0.55+pressure*0.3)*asr(pressure*envelopeAttack,100,pressure*envelopeRelease,gate);
breath = envelope + envelope*noiseGain*noise;

//envVibrato is decalred in instrument.lib
vibrato = vibratoGain*envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,gate)*osc(vibratoFreq);
breathPressure = breath + breath*vibratoGain*osc(vibratoFreq);

//Body filter is a one zero filter (declared in instrument.lib)
bodyFilter = *(gain) : oneZero1(b0,b1)
	with{
		gain = -0.95;
		b0 = 0.5;
		b1 = 0.5;	
	};

instrumentBody(delay1FeedBack,breathP) = delay1FeedBack <: -(delay2) <: 
	((breathP - _ <: breathP - _*reedTable) - delay1FeedBack),_;

