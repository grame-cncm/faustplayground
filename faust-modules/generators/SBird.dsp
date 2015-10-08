declare name "bird";
declare author "Pierre Cochard";

//Modifications by Grame July 2014, June 2015;

/* =============== DESCRIPTION ================= :

- Bird singing generator.
- Right = maximum speed of whistles.
- Left = minimum speed/Rare birds, nearly silence.

*/

import("music.lib");
import("oscillator.lib");
import("effect.lib");

// PROCESS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

process = hgroup("Bird", mainOsc(noteTrig : rdm(72,94) : mtof , noteTrig) * envWrapper(noteTrig, ampEnv, amp_xp(2510)) : lowpass(1, 2500) *(0.8) <: _,_);

// AUTO TRIGGER

autoTrig = beat(t) * (abs(noise) <= p) : trigger(48) 
	with {
		t = hslider("[1]Speed (Granulator)[style:knob][acc:0 0 -10 0 10]", 240, 120, 480, 0.1) : smooth(0.999);
		p = hslider("[2]Probability (Granulator)[unit:%][style:knob][acc:0 0 -10 0 10]", 50, 25, 100, 1)*(0.01) : smooth(0.999);
		trigger(n) 	= upfront : release(n) : >(0.0) 
		with {
			upfront(x) 	= (x-x') > 0.0;
			decay(n,x)	= x - (x>0.0)/n;
			release(n)	= + ~ decay(n);
			};
		};


// BIRD TRIGGER

noteTrig = autoTrig;

// OSCILLATORS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  

/* base */
carrierOsc(freq) = osci(freq);
modOsc(freq) = triangleN(3,freq);

/* fm oscillator */
mainOsc(freq,trig) = freq <: +(*(harmRatio <: +(*(envWrapper(trig,harmEnv,harm_xp(1700))))) : modOsc : *(modIndex <: +(*(envWrapper(trig,modIndexEnv,modIndex_xp(550)))))) <: +(*(envWrapper(trig,freqEnv,freq_xp(943)))) : carrierOsc;

envWrapper(trig,env,sus) = trig : mstosamps(rdm(100,3000)), sus : hitLength : env;


// FIXED PARAMETERS - - - - - - - - - - - - - - - - - - - - - - - - - - - 

/* fm */
harmRatio = 0.063;
modIndex = 3.24;

// TIME FUNCTIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

metro(ms) =  (%(+(1),mstosamps(ms))) ~_ : ==(1);
mstosamps(ms) = ms : /(1000) * SR : int;
rdmInc = _ <: @(1), @(2) : + : *(2994.2313) : int : +(38125); 
rdm(rdmin,rdmax) = _,(fmod(_,rdmax - rdmin : int) ~ rdmInc : +(rdmin)) : gater : -(1) : abs;
gater = (_,_,_ <: !,_,!,_,!,!,!,!,_ : select2) ~_;

// MIDI RELATED - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

/* midi pitch */ 
mtof(midinote) = pow(2,(midinote - 69) / 12) * 440;

// ENVELOPPES - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

/* envelope "reader" (phaser) */

hitLength(length,sustain) = *((==(length,@(length,1))), +(1))~_ <: gater(<(sustain));

/* amplitude envelope */

ampEnvbpf = bpf.start(0, 0) : 
	bpf.point(amp_xp(60.241), 1.) : 
	bpf.point(amp_xp(461.847), 0.) :
	bpf.point(amp_xp(582.329), 0.928) : 
	bpf.point(amp_xp(682.731), 0.5) : 
	bpf.point(amp_xp(983.936), 0.) : 
	bpf.point(amp_xp(1064.257), 0.) : 
	bpf.point(amp_xp(1345.382), 0.) : 
	bpf.point(amp_xp(1526.105), 0.) : 
	bpf.point(amp_xp(1746.988), 0.) : 
	bpf.point(amp_xp(1827.309), 0.) : 
	bpf.point(amp_xp(2088.353), 0.) : 
	bpf.point(amp_xp(2188.755), 0.) : /* sustain point */
	bpf.end(amp_xp(2510.040), 0.);

ampEnv = ampEnvbpf : smooth(0.999) : lowpass(1, 3000);
amp_xp(x) = x * SR / 1000. * ampEnv_speed;
ampEnv_speed = noteTrig : rdm(0,2000) : /(1000);

/* freq envelope */

freqEnvbpf =  bpf.start(0, 0) : 
	bpf.point(freq_xp(147.751), 1.) : 
	bpf.point(freq_xp(193.213), 0.) : 
	bpf.point(freq_xp(318.233), yp) : 
	bpf.point(freq_xp(431.888), 0.) : 
	bpf.point(freq_xp(488.715), 0.434) : 
	bpf.point(freq_xp(613.735), yp) : 
	bpf.point(freq_xp(659.197), 1.) : 
	bpf.point(freq_xp(716.024), yp) : 
	bpf.point(freq_xp(806.948), 1.) : 
	bpf.point(freq_xp(829.679), yp) : /* sustain point */
	bpf.end(freq_xp(943.333), 0.);

freqEnv = freqEnvbpf : smooth(0.999) : lowpass(1, 3000);
freq_xp(x) = x * SR / 1000. * freqEnv_speed;
freqEnv_speed = noteTrig : rdm(0,2000) : /(1000);
yp = noteTrig : rdm(0,1000) : /(1000);

/* harmRatio envelope */

harmEnvbpf = bpf.start(0, 0.) : 
	bpf.point(harm_xp(863.454), 0.490) : 
	bpf.point(harm_xp(865), 0.) : 
	bpf.point (harm_xp(1305.221), 1.) : 
	bpf.point(harm_xp(1646.586), 0.) : /* sustain point */
	bpf.end(harm_xp(1700), 0.);

harmEnv = harmEnvbpf : smooth(0.999) : lowpass(1, 3000);
harm_xp(x) = x * SR / 1000. * harmEnv_speed;
harmEnv_speed = noteTrig : rdm(0,2000) : /(1000);

/* modIndex envelope */

modIndexEnvbpf = bpf.start(0, 0.) : 
	bpf.point(modIndex_xp(240.964), 0.554) : 
	bpf.point(modIndex_xp(502.068), 0.) : /* sustain point */
	bpf.end(modIndex_xp(550), 0.);

modIndexEnv = modIndexEnvbpf : smooth(0.999) : lowpass(1, 3000);
modIndex_xp(x) = x * SR / 1000. * modIndexEnv_speed;
modIndexEnv_speed = noteTrig : rdm(0,2000) : /(1000);


