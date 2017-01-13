declare name "Bouncy Harp";
declare author "ER"; //From Nonlinear EKS by Julius Smith and Romain Michon;

import("stdfaust.lib");

/* =============== DESCRIPTION ================= :

Do not hesitate to make swift and abrupt gestures.
- Head : Silence/reverb.
- Swing :  To pluck the strings of the harp.
- Fishing rod with abrupt stop in Head position : bouncing string effect.
- Frying Pan and Tennis Racket : to pluck a single bouncing string.
- LOOPING MODE : 
==> Bottom position/Rotation around Bottom = record loop
==> Head = listen to loop
==> Swift mouvements around head = siren/scratched record effect

*/

//==================== INSTRUMENT =======================

process = par(i, N, NFLeks(i)):>_<: select2(byPass,capture,_) <: instrReverbHarp;

NFLeks(n) = filtered_excitation(n,P(octave(n)),octave(n)) : stringloop(octave(n));
 
capture = _<:capt,_ : select2(B)
		with{
		B = hand > (0.5);		// Capture sound while hand plays
		I = int(B);				// convert button signal from float to integer
		R = (I-I') <= 0;		// Reset capture when button is pressed
		D = (+(I):*(R))~_;		// Compute capture duration while button is pressed: 0..NNNN0..MMM

		capt = *(B) : (+ : de.delay(1048576, D-1)) ~ *(1.0-B) ;
		};															

//==================== GUI SPECIFICATION ================

N = 15;
hand = hslider("[1]Instrument Hand (Loop mode: hand>0 = recording, 0 = playback)[acc:1 0 -8 0 11]", 0, 0, N, 1);// => gate
gain = 1;
byPass = checkbox("[7]Loop Mode ON/OFF (max 20s)") : reverse;//In loop capture mode : hand>0 = recording, 0 = stop recording/playback (Y axis upward)
reverse = select2(_, 1, 0);
pickangle = 0.9 * hslider("[3]Dry/Soft Strings[acc:2 1 -10 0 10]", 0.45,0,0.9,0.1);

beta = hslider("[4]Picking Position [acc:2 1 -10 0 10]", 0.13, 0.02, 0.5, 0.01);
t60 = hslider("[5]Resonance (InstrReverb)[acc:1 1 -10 0 10]", 5, 0.5, 10, 0.01);  // -60db decay time (sec)

B = 0.5;
L = -10 : ba.db2linear;

//---------------------------------- FREQUENCY TABLE ---------------------------
freq(0) = 115;
freq(1) = 130;
freq(2) = 145;
freq(3) = 160;
freq(4) = 175;

freq(d)	 = freq(d-5)*(2);
octave(d) = freq(d) * hslider("[2]Hight[acc:0 0 -10 0 10]", 3, 1, 6, 0.1) : si.smooth(0.999);	
	

//==================== SIGNAL PROCESSING ================

//----------------------- noiseburst -------------------------
// White no.noise burst (adapted from Faust's karplus.dsp example)
// Requires music.lib (for no.noise)
noiseburst(d,e) = no.noise : *(trigger(d,e))
    with {
        upfront(x) = (x-x') > 0;
        decay(n,x) = x - (x>0)/n;
        release(n) = + ~ decay(n);
        position(d) = abs(hand - d) < 0.5;
        trigger(d,n) = position(d) : upfront : release(n) : > (0.0);
    };

P(f) = ma.SR/f ; // fundamental period in samples
Pmax = 4096; // maximum P (for de.delay-line allocation)

ppdel(f) = beta*P(f); // pick position de.delay
pickposfilter(f) = fi.ffcombfilter(Pmax,ppdel(f),-1); // defined in filter.lib

excitation(d,e) = noiseburst(d,e) : *(gain); // defined in signal.lib

rho(f) = pow(0.001,1.0/(f*t60)); // multiplies loop-gain

// Original EKS damping filter:
b1 = 0.5*B; b0 = 1.0-b1; // S and 1-S
dampingfilter1(f,x) = rho(f) * ((b0 * x) + (b1 * x'));

// Linear phase FIR3 damping filter:
h0 = (1.0 + B)/2; h1 = (1.0 - B)/4;
dampingfilter2(f,x) = rho(f) * (h0 * x' + h1*(x+x''));

loopfilter(f) = dampingfilter2(f); // or dampingfilter1

filtered_excitation(d,e,f) = excitation(d,e) : si.smooth(pickangle) 
		    : pickposfilter(f) : fi.levelfilter(L,f); // see filter.lib

stringloop(f) = (+ : de.fdelay4(Pmax, P(f)-2)) ~ (loopfilter(f));

instrReverbHarp = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) : 
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("v:[8]Reverb/ Reverberation Volume (InstrReverb)[acc:1 1 -10 20 0 0.5] ",0.5,0.1,1,0.01) : si.smooth(0.999);
       roomSize = hslider("v:[8]Reverb/ÒReverberation Room Size (InstrReverb)[acc:1 1 -10 0 25]", 0.72,0.01,2,0.01);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };

