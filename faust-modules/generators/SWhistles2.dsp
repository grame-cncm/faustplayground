declare name "Whistles 2";
declare author "ER";
declare version "1.0";

/* =========== DESCRIPTION ============

- Triple whistle
- Head = Silence
- Rocking/Swing/Fishing Rod = Alternating the different whistles
- Vary your gestures' speed to increase sound

*/

import("stdfaust.lib");
instrument = library("instruments.lib");

//----------------- INSTRUMENT ------------------//

process = vgroup("Whistles", nOise.white * (0.5) <: par(i, 3, whistle(i))):>_;

whistle(n) =  BP(n) : EQ(n) :  @(10 + (12000*n)) <:Reson(0),_*(1.5):> *(Env)*gain(n);

//----------------- NOISES ----------------------//

nOise = environment {

// white no.noise generator:
	random  = +(12345)~*(1103515245);
	white   = random/2147483647.0;
};
	
//----------------- FILTERS -------------------//


freq = hslider("[2]Frequency[unit:Hz][acc:1 1 -10 0 10]", 400, 220, 660, 0.01):si.smooth(0.999);
gain(n) = hslider("[3]Volume %n[style:knob][acc:%n 0 -10 15 0 0.5]", 0.5, 0, 2, 0.001):si.smooth(0.999);

hight(n) = freq * (n+1);
level = 20;
Lowf(n) = hight(n) - Q;
Highf(n) = hight(n) + Q;

Q = 1.5 : si.smooth(0.999);//hslider("Q - Filter Bandwidth[style:knob][unit:Hz][tooltip: Band width = 2 * Frequency]",2.5,1,10,0.0001):si.smooth(0.999);

BP(n) = fi.bandpass(1, Lowf(n), Highf(n));
EQ(n) = fi.peak_eq(level,hight(n),Q) : fi.lowpass(1, 6000);
Reson(n) = fi.resonbp(hight(n),Q,1) : fi.lowpass(1,3000);

Env = (instrument.envVibrato(b,a,s,r,t))
	with {
		b = 0.25; 
		a = 0.1;
		s = 100;
		r = 0.8;
		t = hslider("[1]ON/OFF (Vibrato Envelope)[acc:1 0 -12 0 2]", 1, 0, 1, 1);
    };
		
