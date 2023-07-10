declare name 		"os.osc";
declare version 	"1.0";
declare author 		"Grame";
declare license 	"BSD";
declare copyright 	"(c)GRAME 2009";

//-----------------------------------------------
// 			Sinusoidal Oscillator
//-----------------------------------------------

/* =========== DESCRIPTION =============

- Simple sine wave oscillator
- Left = low frequencies
- Right = high frequencies
- Front = around 300Hz
- Rocking = from low to high
*/ 

import("stdfaust.lib");

freq 			= hslider("Frequency [unit:Hz] [acc:0 1 -10 0 10]", 300, 70, 2400, 0.01):si.smooth(0.999);
process 		= vgroup("Oscillator", os.osc(freq));

