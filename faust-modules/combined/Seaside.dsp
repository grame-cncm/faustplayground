declare name "Seaside";
declare autho "ER";


/* =========== DESCRIPTION ============

- Pink no.noise filtering which emulates the sound of waves, of the sea
- Rocking = waves coming back and forth
- Head = Slight reverberation

*/

import("stdfaust.lib");
instrument = library("instruments.lib"); 

process = Pink : fi.bandpass(1, Lowf, Highf) <: instrReverbSea :> _

// ----------------------- Band Pass Filter --------------------------

    with {
        freq = 200;
        Lowf = freq - Q;
        Highf = freq + Q;
        Q = hslider("[1]Q - Filter Bandwidth (Bandpass)[style:knob][unit:Hz][acc:0 1 -10 0 10]", 30,10,150,0.0001):si.smooth(0.999);
    };

// ----------------------- Pink Noise --------------------------------

Pink = (w : p) * (3);

// pink no.noise filter (-3dB per octave), see musicdsp.org

p	= f : (+ ~ g) with {
	f(x)	= 0.04957526213389*x - 0.06305581334498*x' +
		  0.01483220320740*x'';
	g(x)	= 1.80116083982126*x - 0.80257737639225*x';
};

// white no.noise generator

rand  = +(12345)~*(1103515245);
w   = rand/2147483647.0;

// ----------------------- InstrReverb --------------------------------

instrReverbSea = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) :
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("[2]Reverberation Volume (InstrReverb)[acc:1 1 -10 0 10]",0.1,0.05,1,0.01) : si.smooth(0.999) : min(1) : max(0.05);
       roomSize = hslider("[3]Reverberation Room Size (InstrReverb)[acc:1 1 -10 0 10]", 0.1,0.05,2,0.01) : min(2) : max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };
