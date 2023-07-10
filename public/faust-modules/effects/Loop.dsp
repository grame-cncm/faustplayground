declare name 		"Loop";
declare version 	"1.0";
declare author 		"Grame";
declare license 	"BSD";
declare copyright 	"(c)GRAME 2006";

/* =========== DESCRITPION ===========

- Record and Loop up to 20s of sound
- Activate the Loop Mode : 1 = ON, 0 = OFF
- When Loop Mode is active : 
==> Head = Not recording/ Looping the recorded sound
==> Bottom = Recording sound
==> Swift movements around Head = scratched record effect

*/

import("stdfaust.lib");

B = hslider("Start/Stop Recording (Max 20s)[acc:1 0 -10 0 12]", 1,0,1,1);	// Capture sound while pressed
I = int(B);				// convert button signal from float to integer
R = (I-I') <= 0;		// Reset capture when button is pressed
D = (+(I):*(R))~_;		// Compute capture duration while button is pressed: 0..NNNN0..MMM


capture = *(B) : (+ : de.delay(1048576, D-1)) ~ *(1.0-B) ;

level = hslider("Volume [unit:dB]", 0, -96, 4, 0.1) : ba.db2linear : si.smooth(0.999);
captONOFF = hslider("Loop Mode ON/OFF",0,0,1,1);

process = vgroup( "LOOP", _<:_,(_<:capture,_ : select2(B)): select2(captONOFF) *(level) ) ;

