declare name "Wooden Keyboard";
declare author "ER";

import("stdfaust.lib");
instrument = library("instruments.lib"); 

//d'apres les enveloppes de John Chowning utilisees dans Turenas

/* =============== DESCRIPTION ================= :

- Wooden keyboard
- Head = Echo/Silence
- Rocking = striking across the keyboard from low frequencies (Left) to high frequencies (Right)
- Back + Rotation = long notes
- Front + Rotation = short notes

*/

//--------------------------------- INSTRUMENT ---------------------------------

marimkey(n) = os.osc(octave(n)) * (0.1)
			  *(trigger(n+1) : enveloppe : fi.lowpass(1,500));

process = hand <: par(i, 10, marimkey(i)) :> echo *(3);

//---------------------------------- UI ----------------------------------------

hand = hslider("[1]Instrument Hand[acc:1 0 -10 0 10]", 5, 0, 10, 1);
hight = hslider("[2]Hight[acc:0 1 -10 0 30]", 5, 1, 10, 0.3) : si.smooth(0.99):min(12):max(1);				
envsize = hslider("[3]Note Duration (BPF Envelope) [unit:s][acc:2 0 -10 0 10]", 0.2, 0.1, 0.5, 0.01) * (ma.SR) : si.smooth(0.999): min(44100) : max(4410) : int;
feedback = hslider("[4]Echo Intensity[acc:1 1 -10 0 15]", 0.1, 0.01, 0.9, 0.01):si.smooth(0.999):min(0.9):max(0.01);
			
//---------------------------------- FREQUENCY TABLE ---------------------------
freq(0) = 164.81;
freq(1) = 174.61;
freq(d)	 = freq(d-2);	
	
octave(d) = freq(d)* hight;
							
//------------------------------------ TRIGGER ---------------------------------

upfront(x) 	= x>x';
counter(g)= (+(1):*(1-g))~_;
position(a,x) = abs(x - a) < 0.5;

trigger(p) = position(p) : upfront : counter; 	

//------------------------------------ ECHO ------------------------------------

echo = +~(@(echoDelay)*(feedback));
echoDelay = 8096;

//----------------------------------- ENVELOPPES ------------------------------

/* envelope */

enveloppe = tabchowning.f9;

/* Tables Chowning */

tabchowning = environment
{
corres(x) = int(x*envsize/1024);
// f9 0 1024 7 1 248 0.25 259 0.1 259 0.05 258 0 

f9 = ba.bpf.start(0, 0):
ba.bpf.point(corres(2), 0.25):
ba.bpf.point(corres(4), 0.5):
ba.bpf.point(corres(10), 0.9):
ba.bpf.point(corres(248), 0.25):
ba.bpf.point(corres(507), 0.1):
ba.bpf.point(corres(766), 0.05):
ba.bpf.end(corres(1024), 0);
};
