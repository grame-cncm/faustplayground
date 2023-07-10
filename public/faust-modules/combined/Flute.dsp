declare name "Flute";
declare description "Nonlinear WaveGuide Flute";
declare author "Romain Michon (rmichon@ccrma.stanford.edu)";
declare copyright "Romain Michon";
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
declare description "A simple flute based on Smith algorythm: https://ccrma.stanford.edu/~jos/pasp/Flutes_Recorders_Pipe_Organs.html";

//Modifications GRAME July 2015

/* =========== DESCRITPION ===========

- Flute
- Turn ON flute (0=OFF, 1=ON)
- Head = High frequencies/ Reverberation/ Silence
- Bottom = Low frequencies
- Left = No vibrato
- Right = Fast vibrato
- Front = Full sound
- Back = Breathy sound

*/

import("stdfaust.lib");
instrument = library("instruments.lib"); 

//==================== INSTRUMENT =======================

flute = (_ <: (flow + *(feedBack1) : embouchureDelay: poly) + *(feedBack2) : reflexionFilter)~(boreDelay) : NLFM : *(env2)*gain;

process = flute  <:instrReverbFlute;

//==================== GUI SPECIFICATION ================

freq = hslider("[1]Frequency[acc:1 1 -10 0 10]", 440,247,1200,1):si.smooth(0.999);
pressure = hslider("[2]Pressure[style:knob][acc:1 0 -10 0 10]", 0.96, 0.2, 0.99, 0.01):si.smooth(0.999):min(0.99):max(0.2);
breathAmp = hslider("[3]Breath Noise[style:knob][acc:2 0 -10 0 10]", 0.02, 0.01, 0.2, 0.01):si.smooth(0.999):min(0.2):max(0.01);

gate = hslider("[0]ON/OFF (ASR Envelope)",0,0,1,1);
vibratoFreq = hslider("[4]Vibrato Freq (Vibrato Envelope)[style:knob][unit:Hz][acc:0 1 -10 0 10]", 4,0.5,8,0.1);
env1Attack = 0.1;//hslider("h:Parameters/Press_Env_Attack[unit:s][style:knob][acc:1 0 -10 0 10][tooltip:Pressure envelope attack duration]",0.05,0.05,0.2,0.01);

//-------------------- Non-Variable Parameters -----------

gain = 1;
typeModulation = 0;
nonLinearity = 0;
frequencyMod = 220;
nonLinAttack = 0.1;
vibratoGain = 0.05;
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

//------------------------ InstrReverb ----------------------------------------

instrReverbFlute = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) :
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("h:[5]Reverb/[1]Reverberation Volume (InstrReverb)[style:knob][acc:1 1 -30 0 13]", 0.2,0.05,1,0.01) : si.smooth(0.999):min(1):max(0.05);
       roomSize = hslider("h:[5]Reverb/[2]Reverberation Room Size (InstrReverb)[style:knob][acc:1 1 -30 0 13]", 0.72,0.05,1.7,0.01):min(1.7):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };
