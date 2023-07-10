import("stdfaust.lib");
process = * (button("On Off"):ba.toggle:si.smooth(0.998));