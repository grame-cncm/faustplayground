declare name "Flappy Flute";
declare author "ER";// Adapted from "Nonlinear WaveGuide Flute" by Romain Michon (rmichon@ccrma.stanford.edu)

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =============== DESCRIPTION ======================== :

- Flute turning into a flapping bird
- Head = Reverberation / High frequencies
- Tilting and jerking = looking for different sounds around head and back
- Bottom = Low frequencies
- Swing (bottom to head) = glissando (nice when followed with Back)
- Back = Echo
- Left = Slow rhythm/Silence
- Right = Flapping bird

*/

//==================== INSTRUMENT =======================

flute = (_ <: (flow + *(feedBack1) : embouchureDelay: poly) + *(feedBack2) : reflexionFilter)~(boreDelay) : NLFM : *(env2)*gain:_;

process = vgroup("Flappy Flute", flute : echo <: instrReverbFlute);


//==================== GUI SPECIFICATION ================

freq = hslider("[1]Frequency[unit:Hz][tooltip:Tone frequency][acc:1 1 -10 0 10]", 440,247,1200,1):si.smooth(0.999);
pressure = hslider("h:[3]Parameters/ Pressure[style:knob][acc:0 0 -10 0 10]", 1, 0.6, 1, 0.01):si.smooth(0.999):min(1):max(0.6);
breathAmp = hslider("h:[3]Parameters/Breath Noise[style:knob][acc:0 1 -10 0 10]", 0.01, 0.01, 0.2, 0.01):si.smooth(0.999):min(0.2):max(0.01);

gate = pulsaflute.gate;
vibratoFreq = 5;//hslider("h:Parameters/Vibrato Frequency[style:knob][unit:Hz]",5,1,15,0.1);
env1Attack = 0.05;//hslider("h:Parameters/Envelope Attack[unit:s][style:knob][tooltip:Pressure envelope attack duration]",0.05,0.05,0.2,0.01);

//----------------------- Echo ----------------------------------------

echo = +~ @(22050) *(feedback);
feedback = hslider("h:[4]Reverberation/Echo Intensity[style:knob][acc:2 0 -10 10 0 0.001] ", 0.001, 0.001, 0.65, 0.001):si.smooth(0.999):min(0.65):max(0.001);

//----------------------- Pulsar --------------------------------------


pulsaflute = environment{

gate = phasor_bin(1) :-(0.001):pulsar;
ratio_env = (0.5);
fade = (0.5);
speed = hslider ("h:[2]Instrument/[2]Speed (Granulator)[style:knob][acc:0 1 -10 0 10]", 4,1,16,0.0001):fi.lowpass(1,1);
proba = hslider ("h:[2]Instrument/[3]Probability (Granulator)[unit:%][style:knob][acc:1 0 -10 0 10]", 88,60,100,1) *(0.01) : fi.lowpass(1,1);

phasor_bin (init) =  (+(float(speed)/float(ma.SR)) : fmod(_,1.0)) ~ *(init);
pulsar = _<:(((_)<(ratio_env)):@(100))*((proba)>((_),(no.noise:abs):ba.latch)); 

};

//-------------------- Non-Variable Parameters -----------
N = 27;

gain = hslider("h:[2]Instrument/[1]Volume[style:knob][acc:0 1 -12 0 12]", 1, 0.75, 4, 0.01):min(4):max(0.75);
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
env2Attack = 0.05;
env2Release = 0.05;
env1Release = 0.05;

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
       roomSize = hslider("h:[4]Reverberation/Reverberation Room Size (InstrReverb)[style:knob][acc:1 1 -30 0 16]", 0.72,0.05,2,0.01):min(2):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };
