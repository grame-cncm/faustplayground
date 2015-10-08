declare name "Random Vibrato";

/* ========== DESCRITPION ===========

- Vibrato processor which randomly changes the vibrato frequency
- Left = Irregular and rare changes
- Right = Regular and frequent changes
- Front = Low ranging vibrato frequencies
- Back = High ranging vibrato frequencies

*/

import("music.lib");
import("filter.lib");

//Random Vibrato:

process = *(vibrato);

//----------------- VIBRATO --------------------//

vibrato = vibratoGain * osc(vibratoFreq) + (1-vibratoGain);
vibratoGain = hslider("[2]Vibrato Intensity[style:knob][acc:1 1 -10 0 10]", 0.1, 0.05, 0.4, 0.01) : smooth(0.999);
vibratoFreq = vfreq; 
vibratoSpeed = hslider("[1]Vibrato Speed Range[scale:log][acc:2 0 -10 0 10]", 10, 5, 40, 1) : smooth(0.99) : min(40) : max(1);

//--------------------------- Random Frequency ---------------------------

vfreq = pulsawhistle.gate : randfreq : smooth(0.99) : lowpass (1, 3000); 
randfreq(g) = noise : sampleAndhold(sahgate(g))*(vibratoSpeed)
with{
sampleAndhold(t) = select2(t) ~_;
sahgate(g) = g : upfront : counter -(3) <=(0);
upfront(x) = abs(x-x')>0.5;
counter(g) = (+(1):*(1-g))~_;
};

//----------------------- Pulsar --------------------------------------


pulsawhistle = environment{

gate = phasor_bin(1) :-(0.001):pulsar;
ratio_env = (0.5);
fade = (0.5); // min > 0 pour eviter division par 0
speed = hslider ("[3]Occurrence Speed (Granulator)[unit:Hz][style:knob][acc:0 0 -10 0 10]", 4,0.001,10,0.0001):lowpass(1,1);
proba = hslider ("[4]Probability (Granulator)[unit:%][style:knob][acc:0 0 -10 0 10]", 88,75,100,1) *(0.01):lowpass(1,1);

phasor_bin (init) =  (+(float(speed)/float(SR)) : fmod(_,1.0)) ~ *(init);
pulsar = _<:(((_)<(ratio_env)):@(100))*((proba)>((_),(noise:abs):latch)); 

};
