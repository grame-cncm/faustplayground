declare name "Limiter";
declare author "Yann Orlarey";

/* ========= DESCRITPION ==========

- A limiter is a security that prevents a sound from saturating

*/

process =slimiter;

slimiter(x,y) =x*coeff,y*coeff

	with {
		epsilon =1/(44100*1.0);
		peak = max(abs(x),abs(y)):max~-(epsilon);
		coeff = 1.0/max(1.0,peak);
    };
		
