declare name "Noises";
declare author "ER";
declare version "1.0";

import("stdfaust.lib");

/* ============ DESCRIPTION =============:

- White Noise and Pink Noise generator.
- Head = silence.
- Fishing rod = Volume variation.
- Right = silence.
- Face = pink no.noise.
- Left = white no.noise.
- Rocking to switch from one no.noise to another.
*/

// pink no.noise filter (-3dB per octave), see musicdsp.org

p	= f : (+ ~ g) with {
	f(x)	= 0.04957526213389*x - 0.06305581334498*x' +
		  0.01483220320740*x'';
	g(x)	= 1.80116083982126*x - 0.80257737639225*x';
};

// white no.noise generator

rand  = +(12345)~*(1103515245);
w   = rand/2147483647.0;

White = w * hslider("White Noise Volume[acc:1 0 -10 0 10][style:knob]", 0.5, 0, 2, 0.01);

Pink = (w : p) * (2) * hslider("Pink Noise Volume[acc:1 0 -10 0 10][tooltip:0=Mute, 1=White Noise, 2=Pink Noise][style:knob]", 0.5, 0, 2, 0.01);

NoiseType = hslider("Noise Type[acc:0 0 -10 0 10]", 1,0,2,1);

Ntype(n) = abs(NoiseType - n) < 0.5;

Noise(0) = 0;
Noise(1) = Pink;
Noise(2) = White;

process = par(i, 3, Noise(i) * Ntype(i)) :>_;
