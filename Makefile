#
# FaustPlayGround makefile
#

#LIBSDIR := js/Lib
LIBSDIR := lib
FMODULE := node_modules/@grame/libfaust
PORT    ?= 8000

all:
	make compile
	make libs

#===============================================================
help:
	@echo "-------- FaustPlayGround makefile --------"
	@echo "Available targets are:"
	@echo " 'all' (default) : call the 'compile' and 'libs' targets."
	@echo
	@echo " 'compile'       : compile the faust playground js library."
	@echo " 'libs'          : install the dependent libraries to $(JSLIBS)."
	@echo
	@echo " 'install'       : fetch the dependent js libraries from npm."
	@echo " 'test'          : launch a local server on port $(PORT) to test the web site."
#===============================================================

compile : 
	tsc --noImplicitThis --noUnusedLocals -target es6 -outFile js/faustplayground.js js/Main.ts


libs: $(LIBSDIR) $(LIBSDIR)/libfaust-wasm.js $(LIBSDIR)/FaustLibrary.js libfaust-wasm.data


install:
	npm install

test :
	cd .. && python -m http.server $(PORT)

#===============================================================
$(LIBSDIR):
	mkdir $(LIBSDIR)

$(LIBSDIR)/libfaust-wasm.js : $(FMODULE)/libfaust-wasm.js
	cp $(FMODULE)/libfaust-wasm.js $(LIBSDIR)/libfaust-wasm.js
	cp $(FMODULE)/libfaust-wasm.wasm $(LIBSDIR)/libfaust-wasm.wasm

$(LIBSDIR)/FaustLibrary.js : $(FMODULE)/FaustLibrary.js
	cp $< $@

libfaust-wasm.data : $(FMODULE)/libfaust-wasm.data
	cp $< $@
