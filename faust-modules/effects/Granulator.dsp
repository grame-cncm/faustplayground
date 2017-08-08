declare name "Granulator";
declare author "Adapted from sfIter by Christophe Lebreton";

/* =========== DESCRITPTION =============

- The granulator takes very small parts of a sound, called GRAINS, and plays them at a varying speed
- Front = Medium size grains
- Back = short grains
- Left Slow rhythm
- Right = Fast rhythm
- Bottom = Regular occurrences
- Head = Irregular occurrences 
*/

import("stdfaust.lib");

process = hgroup("Granulator", *(excitation : ampf));

excitation = noiseburst(gate,P) * (gain);
ampf = an.amp_follower_ud(duree_env,duree_env);

//----------------------- NOISEBURST ------------------------- 

noiseburst(gate,P) = no.noise : *(gate : trigger(P))
	with { 
	upfront(x) = (x-x') > 0; 
	decay(n,x) = x - (x>0)/n; 
	release(n) = + ~ decay(n); 
	trigger(n) = upfront : release(n) : > (0.0);
	};
	
P = freq; // fundamental period in samples 
Pmax = 4096; // maximum P (for de.delay-line allocation)

gate = phasor_bin(1) :-(0.001):pulsar;
gain = 1;
freq = hslider("[1]Grain Size[style:knob][acc:2 0 -10 0 10]", 200,5,2205,1);
// la frequence donne la largeur de bande extraite du bruit blanc

// PHASOR_BIN //////////////////////////////
phasor_bin (init) =  (+(float(speed)/float(ma.SR)) : fmod(_,1.0)) ~ *(init);
						
// PULSAR //////////////////////////////
//Le pulsar permet de creer une 'pulsation' plus ou moins aleatoire (proba).

pulsar = _<:((_<(ratio_env)):@(100))*(proba>(_,abs(no.noise):ba.latch)); 
speed = hslider ("[2]Speed[unit:Hz][style:knob][acc:0 1 -10 0 10]", 10,1,20,0.0001):fi.lowpass(1,1); 
ratio_env = 0.5;
fade = (0.5); // min > 0 pour eviter division par 0
proba = hslider ("[3]Probability[unit:%][style:knob][acc:1 0 -10 0 10]", 70,50,100,1) * (0.01):fi.lowpass(1,1);
duree_env = 1/(speed: / (ratio_env*(0.25)*fade));
