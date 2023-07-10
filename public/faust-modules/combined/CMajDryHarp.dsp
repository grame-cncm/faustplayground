
declare name  	"CMajDryHarp";
declare author  "ER";//Adapted from Harpe by Yann Orlarey;

//Modification Grame July 2015

import("stdfaust.lib");
instrument = library("instruments.lib"); 

/* =============== DESCRIPTION ================= :

- Reverberated C Major dry harp
- Left = Lower frequencies/Silence when still
- Front = Resonance (longer notes)
- Back = No Resonance (dry notes)
- Right = Higher frequencies/Fast rhythm
- Head = Reverberation
- Rocking = plucking all strings one by one

*/

//-----------------------------------------------
// 		Harpe : simple string instrument
//		(based on Karplus-Strong)
//
//-----------------------------------------------


KEY = 60;	// basic midi key
NCY = 15; 	// note cycle length
CCY = 15;	// control cycle length
BPS = 360;	// general tempo (ba.beat per sec)

   


//-------------------------------Harpe----------------------------------
// Harpe is a simple string instrument. Move the "hand" to play the 
// various strings
//-----------------------------------------------------------------------

process = vgroup("Harp", h : harpe(C,N,K) : instrReverbHarp : *(l),*(l))
	with {
		N = 48; // number of strings
		K = 36; // Midi key of first string
		h = hslider("[1]Instrument Hand[1] [acc:0 1 -10 0 10]", 24, 0, N, 1) : int: ba.automat(bps, 15, 0.0)
			with{
			bps = hslider("h:[2]Parameters/[1]Speed[style:knob][acc:0 1 -12 0 10]", 480, 180, 720, 1):si.smooth(0.999) : min(720) : max(180) : int;
			};
		//l = vslider("h:parameters/volume [style:knob][unit: dB]", -20, -60, 0, 0.01) : ba.db2linear;
		l = -10 : ba.db2linear;
		C = 0.5;
	};

//----------------------------------Harpe--------------------------------
// USAGE:  hand : harpe(C,10,60) : _,_;
//		C is the filter coefficient 0..1
// 		Build a N (10) strings harpe using a pentatonic scale 
//		based on midi key b (60)
//		Each string is triggered by a specific
//		position of the "hand"
//-----------------------------------------------------------------------

harpe(C,N,b) = 	_ <: par(i, N, position(i+1)
							:string(C,Major(b).degree2Hz(i), att, lvl)
							//envReader(twig,enveloppe):*
							: pan((i+0.5)/N) )
				 	:> _,_
	with {
		att  = hslider("h:[2]Parameters/[2]Resonance[style:knob][acc:2 1 -12 0 10]", 5, 0.1, 10, 0.01):min(10):max(0.1); 
		lvl  = 1;
		pan(p) = _ <: *(sqrt(1-p)), *(sqrt(p));
		position(a,x) = abs(x - a) < 0.5;

	};

//----------------------------------Penta-------------------------------
// Pentatonic scale with degree to midi and degree to Hz conversion
// USAGE: Penta(60).degree2midi(3) ==> 67 midikey
//        Penta(60).degree2Hz(4)   ==> 440 Hz
//-----------------------------------------------------------------------

//---------------------------------- Major -------------------------------
// Major scale.
// From Pentatonic scale with degree to midi and degree to Hz conversion
// USAGE: Penta(60).degree2midi(3) ==> 67 midikey
//        Penta(60).degree2Hz(4)   ==> 440 Hz
//-----------------------------------------------------------------------

Major(key) = environment {

	A4Hz = 440; 
	
	degree2midi(0) = key+0;
	degree2midi(1) = key+2;
	degree2midi(2) = key+4;
	degree2midi(3) = key+5;
	degree2midi(4) = key+7;
	degree2midi(5) = key+9;
	degree2midi(6) = key+11;
	degree2midi(7) = key+12;
	degree2midi(d) = degree2midi(d-8)+12;
	
	degree2Hz(d) = A4Hz*semiton(degree2midi(d)-69) with { semiton(n) = 2.0^(n/12.0); };

};   


//----------------------------------String-------------------------------
// A karplus-strong string.
//
// USAGE: string(440Hz, 4s, 1.0, button("play"))
// or	  button("play") : string(440Hz, 4s, 1.0)
//-----------------------------------------------------------------------

string(coef, freq, t60, level, trig) = no.noise*level
							: *(trig : trigger(freq2samples(freq)))
							: resonator(freq2samples(freq), att)
							
			
	with {
		resonator(d,a)	= (+ : @(d-1)) ~ (average : *(a));
		average(x)		= (x*(1+coef)+x'*(1-coef))/2;
		trigger(n) 		= upfront : + ~ decay(n) : >(0.0);
		upfront(x) 		= (x-x') > 0.0;
		decay(n,x)		= x - (x>0.0)/n;
		freq2samples(f) = 44100.0/f;
		att 			= pow(0.001,1.0/(freq*t60)); // attenuation coefficient
	};

 //================================= REVERB ==============================

instrReverbHarp = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) : 
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("h:[3]Reverb/ Reverberation Volume (InstrReverb)[style:knob][acc:1 1 -10 0 10]", 0.2,0.05,1,0.01):si.smooth(0.999):min(1):max(0.05);
       roomSize = hslider("h:[3]Reverb/Reverberation Room Size  (InstrReverb)[style:knob][acc:1 1 -10 0 10]", 0.2,0.05,1.3,0.01):min(1.3):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };
  
