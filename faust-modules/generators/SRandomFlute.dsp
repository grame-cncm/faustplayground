declare name "Random Flute";
declare author "ER";//Adapted from "Nonlinear WaveGuide Flute" by Romain Michon (rmichon@ccrma.stanford.edu);

import("music.lib");
import("instrument.lib");
import("effect.lib");


/* ============== DESCRIPTION ================

- Random frequency flute
- Left = Slow rhythm/long notes/silence
- Right = Fast rhythm/short note

*/
//==================== INSTRUMENT =======================

flute = (_ <: (flow + *(feedBack1) : embouchureDelay: poly) + *(feedBack2) : reflexionFilter)~(boreDelay) : NLFM : *(env2)*gain:_;

process = flute;


//==================== GUI SPECIFICATION ================

pressure = 1;
breathAmp = hslider("h:[3]Parameters/Breath Noise[style:knob][acc:0 0 -10 0 10]", 0.02, 0.01, 0.05, 0.0001):smooth(0.999):min(0.05):max(0.01);

gate = pulsaflute.gate;
vibratoFreq = 5;
env1Attack = 0.05;
//--------------------------- Random Frequency ---------------------------

freq = gate : randfreq : smooth(0.99) : lowpass (1, 3000); 
randfreq(g) = noise : sampleAndhold(sahgate(g))*(1500)+(100)
with{
sampleAndhold(t) = select2(t) ~_;
sahgate(g) = g : upfront : counter -(3) <=(0);
upfront(x) = abs(x-x')>0.5;
counter(g) = (+(1):*(1-g))~_;
};

//----------------------- Pulsar --------------------------------------


pulsaflute = environment{

gate = phasor_bin(1) :-(0.001):pulsar;
ratio_env = (0.5);
fade = (0.5); 
speed = hslider ("h:[1]Pulse/[1]Speed (Granulator)[unit:Hz][style:knob][acc:0 0 -10 0 10]", 3,1,6,0.0001):lowpass(1,1);
proba = hslider ("h:[1]Pulse/[2]Probability (Granulator)[unit:%][style:knob][acc:0 0 -10 0 10]", 88,60,100,1) *(0.01):lowpass(1,1);

phasor_bin (init) =  (+(float(speed)/float(SR)) : fmod(_,1.0)) ~ *(init);
pulsar = _<:(((_)<(ratio_env)):@(100))*((proba)>((_),(noise:abs):latch)); 

};

//-------------------- Non-Variable Parameters -----------
N = 27;

gain = 1;
typeModulation = 0;
nonLinearity = 0;
frequencyMod = 220;
nonLinAttack = 0.1;
vibratoGain = 0.1;
vibratoBegin = 0.1;
vibratoAttack = 0.5;
vibratoRelease = 0.2;
pressureEnvelope = 0;
env1Decay = 0.2;
env2Attack = 0.1;
env2Release = 0.1;
env1Release = 0.5;


//==================== SIGNAL PROCESSING ================

//----------------------- Nonlinear filter ----------------------------
//nonlinearities are created by the nonlinear passive allpass ladder filter declared in filter.lib

//nonlinear filter order
nlfOrder = 6; 

//attack - sustain - release envelope for nonlinearity (declared in instrument.lib)
envelopeMod = asr(nonLinAttack,100,0.1,gate);

//nonLinearModultor is declared in instrument.lib, it adapts allpassnn from filter.lib 
//for using it with waveguide instruments
NLFM =  nonLinearModulator((nonLinearity : smooth(0.999)),envelopeMod,freq,
     typeModulation,(frequencyMod : smooth(0.999)),nlfOrder);

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//Loops feedbacks gains
feedBack1 = 0.4;
feedBack2 = 0.4;

//Delay Lines
embouchureDelayLength = (SR/freq)/2-2;
boreDelayLength = SR/freq-2;
embouchureDelay = fdelay(4096,embouchureDelayLength);
boreDelay = fdelay(4096,boreDelayLength);

//Polinomial
poly = _ <: _ - _*_*_;

//jet filter is a lowwpass filter (declared in filter.lib)
reflexionFilter = lowpass(1,2000);

//----------------------- Algorithm implementation ----------------------------

//Pressure envelope
env1 = adsr(env1Attack,env1Decay,90,env1Release,(gate | pressureEnvelope))*pressure*1.1; 

//Global envelope
env2 = asr(env2Attack,100,env2Release,gate)*0.5;

//Vibrato Envelope
vibratoEnvelope = envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,gate)*vibratoGain; 

vibrato = osc(vibratoFreq)*vibratoEnvelope;

breath = noise*env1;

flow = env1 + breath*breathAmp + vibrato;

