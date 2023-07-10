declare name "Cameleon Keyboard";
declare author "ER";

import("stdfaust.lib");


//From John Chowning Turenas envelops

/* =============== DESCRIPTION ================= :

- Multiple envelope keyboard
- Pick an envelope
- Rocking = striking across the keyboard from low frequencies (Left) to high frequencies (Right)
- Back + Rotation = long notes
- Front + Rotation = short notes

*/

//--------------------------------- INSTRUMENT ---------------------------------

marimkey(n) = os.osc(octave(n)) * (0.1)
			  *(trigger(n+1) : envelope : fi.lowpass(1,500));

process = hand <: par(i, 10, marimkey(i)) :> *(3);

//---------------------------------- UI ----------------------------------------

hand = hslider("[1]Instrument Hand[acc:1 0 -10 0 10]", 5, 0, 10, 1);
hight = hslider("[2]Hight[acc:0 1 -10 0 30]", 5, 1, 10, 0.3) : si.smooth(0.99):min(12):max(1);
envsize = hslider("[3]Note Duration (BPF Envelope)[unit:s][acc:2 0 -10 0 10]", 0.2, 0.1, 0.5, 0.01) * (ma.SR) : si.smooth(0.999): min(44100) : max(4410) : int;
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

//----------------------------------- ENVELOPPES ------------------------------

/* envelope */

typeEnv = vslider("[4]Envelope Type (BPF Envelope)[style:radio{'f9':0;'f11':1;'f15':2;'f17':3}]",0,0,3,1):int;

envelope =  _<:sum(i, 4, tabchowning.env(i) * (abs(typeEnv - (i)) < 0.5));

/* Tables Chowning */

tabchowning = environment

{
// percussives envelops have been smmothed to avoid clicks.

corres(x) = int(x*envsize/1024);

// f9 0 1024 7 1 248 0.25 259 0.1 259 0.05 258 0
env(0) = f9;
f9 = ba.bpf.start(0, 0):
ba.bpf.point(corres(2), 0.25):
ba.bpf.point(corres(4), 0.5):
ba.bpf.point(corres(10), 0.9):
ba.bpf.point(corres(248), 0.25):
ba.bpf.point(corres(507), 0.1):
ba.bpf.point(corres(766), 0.05):
ba.bpf.end(corres(1024), 0);

/*

//f10 0 1024 7 0.5 197 1 310 0.1 259 0.02 258 0
env(1) = f10;
f10 = ba.bpf.start(0, 0):
ba.bpf.point(corres(2), 0.25):
ba.bpf.point(corres(4), 0.5):
ba.bpf.point(corres(197), 0.99):
ba.bpf.point(corres(507), 0.1):
ba.bpf.point(corres(766), 0.02):
ba.bpf.end(corres(1024), 0);
*/

//f11 0 1024 7 0 93 0.02 52 0.1 103 0.5 52 0.95 31 1 538 0.95 52 0.9 52 0.05 51 0
env(1) = f11;
f11 = ba.bpf.start(0, 0):
ba.bpf.point(corres(93), 0.02):
ba.bpf.point(corres(145), 0.1):
ba.bpf.point(corres(248), 0.5):
ba.bpf.point(corres(300), 0.95):
ba.bpf.point(corres(331), 0.99):
ba.bpf.point(corres(869), 0.95):
ba.bpf.point(corres(921), 0.9):
ba.bpf.point(corres(973), 0.05):
ba.bpf.end(corres(1024), 0);

/*
//f12 0 1024 7 0 93 0.02 52 0.1 103 0.5 52 0.95 31 1 693 0.95
env(3) = f12;
f12 = ba.bpf.start(0, 0):
ba.bpf.point(corres(93), 0.02):
ba.bpf.point(corres(145), 0.1):
ba.bpf.point(corres(248), 0.5):
ba.bpf.point(corres(300), 0.95):
ba.bpf.point(corres(331), 0.99):
ba.bpf.point(corres(1018), 0.95):
ba.bpf.point(corres(1020), 0.25):
ba.bpf.point(corres(1022), 0.125):
ba.bpf.end(corres(1024), 0);

//f13 0 1024 7 0 41 0.5 155 1 310 0.2 259 0.02 259 0 0
env(4) = f13;
f13 = ba.bpf.start(0, 0):
ba.bpf.point(corres(41), 0.5):
ba.bpf.point(corres(196), 0.99):
ba.bpf.point(corres(506), 0.2):
ba.bpf.point(corres(765), 0.02):
ba.bpf.end(corres(1024), 0);

//f14 0 1024 7 1 114 0.75 134 1 259 0.25 259 0.05 258 0
env(5) = f14;
f14 = ba.bpf.start(0, 0):
ba.bpf.point(corres(2), 0.25):
ba.bpf.point(corres(4), 0.5):
ba.bpf.point(corres(6), 0.99):
ba.bpf.point(corres(114), 0.75):
ba.bpf.point(corres(248), 0.99):
ba.bpf.point(corres(507), 0.25):
ba.bpf.point(corres(766), 0.05):
ba.bpf.end(corres(1024), 0);
*/
//f15 0 1024 7 1 41 0.1 52 0.02 155 0 776 0
env(2) = f15;
f15 = ba.bpf.start(0, 0):
ba.bpf.point(corres(2), 0.25):
ba.bpf.point(corres(4), 0.5):
ba.bpf.point(corres(6), 0.99):
ba.bpf.point(corres(41), 0.1):
ba.bpf.point(corres(93), 0.02):
ba.bpf.point(corres(248), 0):
ba.bpf.end(corres(1024), 0);

/*
//f16 0 1024 7 0 145 0.1 155 0.5 103 0.95 103 1 103 0.96 103 0.5 155 0.1 157 0
env(7) = f16;
f16 = ba.bpf.start(0, 0):
ba.bpf.point(corres(145), 0.1):
ba.bpf.point(corres(300), 0.5):
ba.bpf.point(corres(403), 0.95):
ba.bpf.point(corres(506), 0.99):
ba.bpf.point(corres(609), 0.96):
ba.bpf.point(corres(712), 0.5):
ba.bpf.point(corres(867), 0.1):
ba.bpf.end(corres(1024), 0);
*/

//f17 0 1024 7 1 103 0.5 145 0.25 259 0.1 259 0.05 259 0
env(3) = f17;
f17 = ba.bpf.start(0, 0):
ba.bpf.point(corres(2), 0.25):
ba.bpf.point(corres(4), 0.5):
ba.bpf.point(corres(6), 0.99):
ba.bpf.point(corres(103), 0.5):
ba.bpf.point(corres(248), 0.25):
ba.bpf.point(corres(403), 0.1):
ba.bpf.point(corres(507), 0.05):
ba.bpf.point(corres(766), 0):
ba.bpf.end(corres(1024), 0);

};
