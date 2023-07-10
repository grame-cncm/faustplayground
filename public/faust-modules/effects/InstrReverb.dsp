declare name "InstrReverb"; //instrument.lib
import("stdfaust.lib");

/* =========== DESCRIPTION =============

- Reverberation
- Head = Maximum Reverberation
- Bottom = No reverberation

*/

process = _<: instrReverb:>_;

instrReverb = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) :
re.zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
    with {
       reverbGain = hslider("v:Reverb/Reverberation Volume[acc:1 1 -10 0 10]",0.1,0.05,1,0.01) : si.smooth(0.999) : min(1) : max(0.05);
       roomSize = hslider("v:Reverb/Reverberation Room Size[acc:1 1 -10 0 10]", 0.1,0.05,2,0.01) : min(2) : max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
    };
