declare name "Volume";
declare author "GRAME";

/* ========== DESCRITPION ===========

- Simple volume slider
- Head = Silence
- Bottom = Max volume

*/

import("filter.lib");

process = par(i,2,*(hslider("Volume[acc:1 1 -10 0 10]", 0.75, 0, 1, 0.01):smooth(0.999)));
