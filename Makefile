compile :
	tsc --noImplicitThis --noUnusedLocals --sourcemap -target es6 -outFile js/faustplayground.js js/Main.ts

test :
	cd .. && python -m http.server 8000
