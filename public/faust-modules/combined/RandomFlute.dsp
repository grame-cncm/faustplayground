declare name "Random Flute";
declare author "ER";//Adapted from "Nonlinear WaveGuide Flute" by Romain Michon (rmichon@ccrma.stanford.edu);

import("stdfaust.lib");
instrument = library("instruments.lib"); 


/* ============== DESCRIPTION ================

- Random frequency flute
- Left = Slow rhythm/long notes/silence
- Right = Fast rhythm/short note
- Head = Reverberation
- Back = Echo

*/

//==================== INSTRUMENT =======================

flute = (_ <: (flow + *(feedBack1) : embouchureDelay: poly) + *(feedBack2) : reflexionFilter)~(boreDelay) : NLFM : *(env2)*gain:_;

process = flute : echo <: instrReverbFlute;


//==================== GUI SPECIFICATION ================

pressure = 1;
breathAmp = hslider("h:[3]Parameters/Breath Noise[style:knob][acc:0 1 -10 0 10]", 0.02, 0.01, 0.05, 0.0001):si.smooth(0.999):min(0.05):max(0.01);

gate = pulsaflute.gate;
vibratoFreq = 5;
env1Attack = 0.05;

//--------------------------- Random Frequency ---------------------------

freq = gate : randfreq : si.smooth(0.99) : fi.lowpass (1, 3000);
randfreq(g) = no.noise : sampleAndhold(sahgate(g))*(1500)+(100)
with{
sampleAndhold(t) = select2(t) ~_;
sahgate(g) = g : upfront : counter -(3) <=(0);
upfront(x) = abs(x-x')>0.5;
counter(g) = (+(1):*(1-g))~_;
};

//----------------------- Echo ----------------------------------------

echo = +~ @(22050) *(feedback);
feedback = hslider("h:Parameters/Echo Intensity[style:knob][acc:2 0 -10 0 10]", 0.001, 0.001, 0.65, 0.001):si.smooth(0.999);

//----------------------- Pulsar --------------------------------------

pulsaflute = environment {

gate = phasor_bin(1) :-(0.001):pulsar;
ratio_env = (0.5);
fade = (0.5); // min > 0 pour eviter division par 0
speed = hslider ("h:[1]Pulse/[1]Speed (Granulator)[unit:Hz][style:knob][acc:0 1 -10 0 10]", 3,1,6,0.0001):fi.lowpass(1,1);
proba = hslider ("h:[1]Pulse/[2]Probability (Granulator)[unit:%][style:knob][acc:0 1 -10 0 10]", 88,60,100,1) *(0.01):fi.lowpass(1,1);

phasor_bin (init) =  (+(float(speed)/float(ma.SR)) : fmod(_,1.0)) ~ *(init);
pulsar = _<:(((_)<(ratio_env)):@(100))*((proba)>((_),(no.noise:abs):ba.latch));

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
envelopeMod = en.asr(nonLinAttack,1,0.1,gate);

//nonLinearModultor is declared in instrument.lib, it adapts allpassnn from filter.lib
//for using it with waveguide instruments
NLFM =  instrument.nonLinearModulator((nonLinearity : si.smooth(0.999)),envelopeMod,freq,
     typeModulation,(frequencyMod : si.smooth(0.999)),nlfOrder);

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//Loops feedbacks gains
feedBack1 = 0.4;
feedBack2 = 0.4;

//Delay Lines
embouchureDelayLength = (ma.SR/freq)/2-2;
boreDelayLength = ma.SR/freq-2;
embouchureDelay = de.fdelay(4096,embouchureDelayLength);
boreDelay = de.fdelay(4096,boreDelayLength);

//Polinomial
poly = _ <: _ - _*_*_;

//jet filter is a lowwpass filter (declared in filter.lib)
reflexionFilter = fi.lowpass(1,2000);


//----------------------- Algorithm implementation ----------------------------

//Pressure envelope
env1 = en.adsr(env1Attack,env1Decay,0.9,env1Release,(gate | pressureEnvelope))*pressure*1.1;

//Global envelope
env2 = en.asr(env2Attack,1,env2Release,gate)*0.5;

//Vibrato Envelope
vibratoEnvelope = instrument.envVibrato(vibratoBegin,vibratoAttack,100,vibratoRelease,gate)*vibratoGain;

vibrato = os.osc(vibratoFreq)*vibratoEnvelope;

breath = no.noise*env1;

flow = env1 + breath*breathAmp + vibrato;


instrReverbFlute = re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       roomSize = hslider("h:Reverb/Reverberation Room Size [style:knob][acc:1 1 -10 0 10]", 0.2,0.01,1.7,0.01);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };
