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
- Head = High frequencies/ Silence
- Bottom = Low frequencies
- Left = No vibrato
- Right = Fast vibrato
- Front = Full sound
- Back = Breathy sound

*/

import("music.lib");
import("instrument.lib");
import("effect.lib");

//==================== INSTRUMENT =======================

flute = (_ <: (flow + *(feedBack1) : embouchureDelay: poly) + *(feedBack2) : reflexionFilter)~(boreDelay) : NLFM : *(env2)*gain:_;

process = flute;

//==================== GUI SPECIFICATION ================

freq = hslider("[1]Frequency[acc:1 0 -10 0 10]", 440,247,1200,1):smooth(0.999);
pressure = hslider("[2]Pressure[style:knob][acc:1 1 -10 0 10]", 0.96, 0.2, 0.99, 0.01):smooth(0.999):min(0.99):max(0.2);
breathAmp = hslider("[3]Breath Noise[style:knob][acc:2 0 -10 0 10]", 0.02, 0.01, 0.2, 0.01):smooth(0.999):min(0.2):max(0.01);

gate = hslider("[0]ON/OFF (ASR Envelope)",0,0,1,1);
vibratoFreq = hslider("[4]Vibrato Freq (Vibrato Envelope)[style:knob][unit:Hz][acc:0 0 -10 0 10]", 4,0.5,8,0.1);
env1Attack = 0.1;//hslider("h:Parameters/Press_Env_Attack[unit:s][style:knob][acc:1 1 -10 0 10][tooltip:Pressure envelope attack duration]",0.05,0.05,0.2,0.01);



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
