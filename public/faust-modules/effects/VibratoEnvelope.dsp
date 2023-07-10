declare name "Vibrato Envelope"; //instrument.lib
import("stdfaust.lib");
instrument = library("instruments.lib");

/* =========== DESCRIPTION ============

- Vibrato generator
- Head = no vibrato
- Bottom = Maximum virato intensity
- Rocking = From slow to fast vibrato

*/

process = vgroup("Vibrato",vibrato);

vibrato = _*((vibratoGain*os.osc(vibratoFreq)+(1-vibratoGain))*vibratoEnv);

vibratoGain = hslider("Vibrato Intensity[style:knob][acc:1 0 -10 0 10]", 0.1, 0.05, 0.4, 0.01) : si.smooth(0.999):min(0.5):max(0.05);
vibratoFreq = hslider("Vibrato Frequency[unit:Hz][acc:0 1 -10 0 10]", 5, 0, 10, 0.001) : si.smooth(0.999);

vibratoEnv =  _ : *(instrument.envVibrato(b,a,s,r,t)) : _
	with {
		b = 0.25;
		a = 1;
		s = 100;
		r = 2;
		t = hslider("h:/ON/OFF Slider[acc:1 0 -10 0 10]", 0, 0, 1, 1);
    };




