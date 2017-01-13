declare name "Flanger";

import("stdfaust.lib");

/* =========== DESCRIPTION ==========

- Flanger effect
- Head = No effect
- Bottom = Maximum Intensity and Amplitude
- Left = Slow Flanging
- Right = Maximum Speed

*/

process = _<:_,(_<:FlangerDemo:>*(0.1)):drywet;

FlangerDemo = flanger_stereo_demo with {
   flanger_group(x) =
    vgroup("FLANGER [tooltip: Reference: https://ccrma.stanford.edu/~jos/pasp/Flanging.html]", x);
   ctl_group(x)  = flanger_group(hgroup("[1]", x));

   invert = 0;// meter_group(checkbox("[1] Invert Flange Sum"));

   flanger_stereo_demo(x,y) = x,y : pf.flanger_stereo(dmax,curdel1,curdel2,depth,fb,invert);

   lfol = os.oscrs; // sine for left channel
   lfor = os.oscrc; // cosine for right channel
   dmax = 2048;
   dflange = 0.001 * ma.SR * 10;
   odflange = 0.001 * ma.SR * 1;
   freq   = ctl_group(hslider("[1] Speed [acc:0 1 -10 0 10][unit:Hz] [style:knob]", 3, 0, 10, 0.01));
   depth  = 1;
   fb     = 0.99;
   curdel1 = odflange+dflange*(1 + lfol(freq))/2;
   curdel2 = odflange+dflange*(1 + lfor(freq))/2;
};

drywet(x,y) = (1-c)*x + c*y
            with {
                c = hslider("[3] Flanger Intensity [unit:%][acc:1 0 -10 0 10]", 10,0,100,0.01)*(0.01):si.smooth(0.999);
                };
