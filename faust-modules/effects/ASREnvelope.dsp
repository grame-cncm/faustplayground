declare name "ASR Envelope";

import("stdfaust.lib");
instrument = library("instruments.lib");

/* =========== DESCRITPTION ============

- An Attack, Sustain, Release envelope is used to "shape" a sound :
==> The ATTACK defines how long it takes to start : it is also called a "fade in"
==> The RELEASE defines how long it takes to end : it is also called a "fade out"
==> The ON/OFF slider is also called GATE or TRIGGER : it is used to trigger the envelope
==> The 'S' in ASR stands for SUSTAIN : it is the sound level in % reached at the end of the attack.
- When the slider is ON, the trigger = 1 and the attack starts.
- When the slider is OFF, the trigger = 0 and the release starts.

- Head = Silence
- Left = Short attack and release (0.01s)
- Front/Back = medium attack and release (1s)
- Right = Long attack (2s) and release (5s)

*/

process = *(en.asr(a,s,r,t)):_

    with {
        a = hslider("[2]Envelope Attack[unit:s][acc:0 1 -10 0 10][style:knob]", 0.1, 0.01, 2, 0.01) : si.smooth(0.999);
        s = 1;
        r = hslider("[3]Envelope Release[unit:s][style:knob][acc:0 1 -10 0 10]", 1, 0.01, 5, 0.01) : si.smooth(0.999);
        //g = checkbox("[1]ON/OFF");
        t = hslider("[1]ON/OFF[acc:1 0 -12 0 5]", 0, 0, 1, 1);
        //t = (g>0)|(sl>0);
    };
