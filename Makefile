default: compile

compile:
	tsc -outFile js/faustplayground.js --sourceMap js/Main.ts --target es6

clean:
	rm -f js/faustplayground.js
	rm -f js/faustplayground.js.map

i18n:
	i18next js -r -f _ --fileFilter '*.ts' -o js/locales --ignore-variables --namespace-separator=":::" --key-separator="::"
	rm -rf js/locales/en

sslcert:
	rm -rf ssl
	mkdir ssl
	openssl genrsa -des3 -out ssl/server.key 2048
	openssl req -new -key ssl/server.key -out ssl/server.csr
	cp ssl/server.key ssl/server.key.org
	openssl rsa -in ssl/server.key.org -out ssl/server.key
	openssl x509 -req -days 365 -in ssl/server.csr -signkey ssl/server.key -out ssl/server.crt
	cat ssl/server.crt ssl/server.key > ssl/server.pem
