declare name "Modulations";
declare author "ER";

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =========== DESCRIPTION ==============

- Non Linear Filter Modulators applied to a sinewave
- Head = Silence/Revereration/Higher Frequencies
- Bottom = Modulation n°3 = FM/ Lower Frequencies
- Rocking = Modulating Frequency (low to high)
- Front = Modulation n°2
- Left = Modulation n°0 & n°1
- Upward = swing from head/bottom/head (a bit like tennis racket) = interesting

*/

//======================== INSTRUMENT =============================

process = vgroup("Modulations",oscil <: seq(i, 3, NLFM(i)), NLFM3 :> fi.lowpass(1,2000) *(0.6) *(vol) <: instrReverbMod:*(vool),*(vool));

NLFM(n) = _ : instrument.nonLinearModulator((nonlinearity:si.smooth(0.999)),env(n),freq,typeMod(n),freqMod,nlfOrder) : _;
NLFM3 = _ : instrument.nonLinearModulator((nonlinearity:si.smooth(0.999)),env(3),freq,typeMod(3),freqMod,nlfOrder) : _;
oscil = os.osci(freq);

//======================== GUI SPECIFICATIONS =====================

freq = hslider("h:Instrument/ Frequency [unit:Hz][acc:1 1 -10 0 15]", 330, 100, 1200, 0.1):si.smooth(0.999);
freqMod = hslider("h:Instrument/Modulating Frequency[style:knob][unit:Hz][acc:0 0 -10 0 10]", 1200, 900, 1700, 0.1):si.smooth(0.999);

vol = (hslider("h:Instrument/ Oscillator Volume[style:knob][acc:1 0 -10 0 10]", 0.5, 0, 1, 0.01)^2):si.smooth(0.999);
vool = hslider("h:Instrument/ General Volume[style:knob][acc:1 1 -10 0 10]", 1, 0.75, 4, 0.01):si.smooth(0.999):min(4):max(0.75);

gate(0) = hslider("v:Modulations/Play Modulation 0 (ASR Envelope)[tooltip:noteOn = 1, noteOff = 0][acc:0 0 -30 0 10]", 0,0,1,1);
gate(1) = hslider("v:Modulations/Play Modulation 1 (ASR Envelope)[tooltip:noteOn = 1, noteOff = 0][acc:0 0 -30 0 5]", 0,0,1,1);
gate(2) = hslider("v:Modulations/Play Modulation 2 (ASR Envelope)[tooltip:noteOn = 1, noteOff = 0][acc:2 1 -30 0 10]", 0,0,1,1);
gate(3) = hslider("v:Modulations/Play Modulation 3 (ASR Envelope)[tooltip:noteOn = 1, noteOff = 0][acc:1 0 -10 0 10]", 0,0,1,1);

//------------------------ NLFM PARAMETERS ------------------------
nlfOrder = 6;
nonlinearity = 0.8;
typeMod(n) = n;

env(n) = ASR(n);
ASR(n) = en.asr(a,s,r,t(n));
a = 3;
s = 1;
r = 2;
t(n) = gate(n);

//----------------------- INSTRREVERB -------------------------------

instrReverbMod = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) :
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("v:Reverb/Reverberation Volume(InstrReverb)[acc:1 1 -10 0 10]",0.25,0.05,1,0.01) : si.smooth(0.999):min(1):max(0.05);
       roomSize = hslider("v:Reverb/Reverberation Room Size(InstrReverb)[acc:1 1 -10 0 10]", 0.5,0.05,2,0.01):min(2):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };
