default: compile

compile:
	tsc -outFile js/faustplayground.js --sourceMap js/Main.ts

clean:
	rm -f js/faustplayground.js
	rm -f js/faustplayground.js.map
