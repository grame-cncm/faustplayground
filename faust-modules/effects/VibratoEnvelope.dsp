declare name "Vibrato Envelope"; //instrument.lib
import("filter.lib");
import("effect.lib");
import("instrument.lib");

/* =========== DESCRIPTION ============

- Vibrato generator
- Head = no vibrato
- Bottom = Maximum virato intensity
- Rocking = From slow to fast vibrato

*/

process = vgroup("Vibrato",vibrato);

vibrato = _*((vibratoGain*osc(vibratoFreq)+(1-vibratoGain))*vibratoEnv);

vibratoGain = hslider("Vibrato Intensity[style:knob][acc:1 1 -10 0 10]", 0.1, 0.05, 0.4, 0.01) : smooth(0.999):min(0.5):max(0.05);
vibratoFreq = hslider("Vibrato Frequency[unit:Hz][acc:0 0 -10 0 10]", 5, 0, 10, 0.001) : smooth(0.999);

vibratoEnv =  _ : *(envVibrato(b,a,s,r,t)) : _
	with{
		b = 0.25;
		a = 1;
		s = 100;
		r = 2;
		t = hslider("h:/ON/OFF Slider[acc:1 1 -10 0 10]", 0, 0, 1, 1);
		};




