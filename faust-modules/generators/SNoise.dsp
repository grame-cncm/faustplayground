declare name 		"White Noise";
declare version 	"1.1";
declare author 		"Grame";
declare license 	"BSD";
declare copyright 	"(c)GRAME 2009";


/* ========== DESCRIPTION ===========

- White no.noise generator
- Head = silence
- Bottom = Maximum volume of the no.noise

*/

random  = +(12345)~*(1103515245);
noise   = random/2147483647.0;

process = noise * hslider("Volume[acc:1 0 -10 0 10][style:knob]", 0.5, 0, 1, 0.01);
