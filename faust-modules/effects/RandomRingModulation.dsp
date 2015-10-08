declare name "Random Ring Modulator";


/* ========== DESCRITPION ===========

- Ring Modulator which randomly changes the modulation frequency
- Left = Irregular and rare changes
- Right = Regular and frequent changes
- Front = Low ranging modulating frequencies
- Back = High ranging modulating frequencies

*/

import("math.lib"); 
import("maxmsp.lib"); 
import("music.lib"); 
import("oscillator.lib"); 
import("reduce.lib"); 
import("filter.lib"); 
import("effect.lib");

process = *(ringmod);

ringmod = oscs(rfreq);
		
ringSpeed = hslider("[1]Ring Modulation Speed Range[scale:log][acc:2 0 -10 0 10]", 20, 10, 10000, 1) : smooth(0.99) : min(10000) : max(1);

//--------------------------- Random Frequency ---------------------------

rfreq = pulsaring.gate : randfreq : smooth(0.99) : lowpass (1, 3000); 
randfreq(g) = noise : sampleAndhold(sahgate(g))*(ringSpeed)
with{
sampleAndhold(t) = select2(t) ~_;
sahgate(g) = g : upfront : counter -(3) <=(0);
upfront(x) = abs(x-x')>0.5;
counter(g) = (+(1):*(1-g))~_;
};

//----------------------- Pulsar --------------------------------------


pulsaring = environment{

gate = phasor_bin(1) :-(0.001):pulsar;
ratio_env = (0.5);
fade = (0.5); // min > 0 pour eviter division par 0
speed = hslider ("[2]Occurrence Speed (Granulator)[unit:Hz][style:knob][acc:0 0 -10 0 10]", 4,0.001,10,0.0001):lowpass(1,1);
proba = hslider ("[3]Probability(Granulator)[unit:%][style:knob][acc:0 0 -10 0 10]", 88,75,100,1) *(0.01):lowpass(1,1);

phasor_bin (init) =  (+(float(speed)/float(SR)) : fmod(_,1.0)) ~ *(init);
pulsar = _<:(((_)<(ratio_env)):@(100))*((proba)>((_),(noise:abs):latch)); 

};
