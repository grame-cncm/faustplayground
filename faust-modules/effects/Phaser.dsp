declare name "Phaser";

import("stdfaust.lib");

/* =========== DESCRIPTION ==========

- Flanger effect
- Head = No effect
- Bottom = Maximum Intensity and Amplitude
- Left = Slow Flanging
- Right = Maximum Speed

*/
process = _<:_,(_<:phaser2Demo:>*(0.2)):drywet;

phaser2Demo = phaser2_stereo_demo with {
   phaser2_group(x) =
    vgroup("PHASER2 [tooltip: Reference: https://ccrma.stanford.edu/~jos/pasp/Flanging.html]", x);
   meter_group(x) = phaser2_group(hgroup("[0]", x));
   ctl_group(x)  = phaser2_group(hgroup("[1]", x));
   nch_group(x)  = phaser2_group(hgroup("[2]", x));
   lvl_group(x)  = phaser2_group(hgroup("[3]", x));

   invert = 0;

   // FIXME: This should be an amplitude-response display:
   //flangeview = phaser2_amp_resp : meter_group(hspectrumview("[2] Phaser Amplitude Response", 0,1));
   //phaser2_stereo_demo(x,y) = attach(x,flangeview),y : ...

   phaser2_stereo_demo =
     pf.phaser2_stereo(Notches,width,frqmin,fratio,frqmax,speed,depth,fb,invert);

   Notches = 4; // Compile-time parameter: 2 is typical for analog phaser stomp-boxes

   // FIXME: Add tooltips
   speed  = ctl_group(hslider("[1]Speed[acc:0 1 -10 0 10] [unit:Hz] [style:knob]", 3, 0, 10, 0.001));
   depth  = 1;
   fb     = 0.8;

   width  = 150;
   frqmin = 100;
   frqmax = 800;
   fratio = 1.5;
};

drywet(x,y) = (1-c)*x + c*y
            with {
                c = hslider("[2]Phaser Intensity[style:knob][unit:%][acc:1 0 -10 0 10]", 10,0,100,0.01)*(0.01):si.smooth(0.999);
                };
