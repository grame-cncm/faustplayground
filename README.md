# FAUST Playground

Faust playground is a Web platform designed to enable children to learn basic audio programming in a simple and graphic way. In particular, it allows them to develop musical instruments for Android smartphones.

## Quick install

Faustplayground embed a web and a websocket server build on top of Twisted and Autobahn frameworks.\
To install all python requirements, the recommended procedure is to create a virtualenv and install faustplayground in it.\
Take the last python2 version and execute the following commands:
 
 ```bash
virtualenv faustplayground-env
. faustplayground-env/bin/activate
cd faustplayground_git_clone
pip install -e .
```

## Run

When install is done, you can run the server in foreground with the following command:
```bash
cd faustplayground_git_clone
twistd -ny server.tac
```
or in background (daemonized) with:
```bash
twistd -y server.tac
```

Then, faustplayground can be seen at
[http://localhost:8080](http://localhost:8080)

When daemonized, pid and log files will be `twistd.pid` and `twisd.log`.\
To tune configuration, please check twistd help with
```bash
twistd --help
```

## Configuration options

### Port
The TCP port used can be modified by editing `server.tac` file.

### SSL
For testing / debugging purposes, you can enable SSL support on the web / websocket server.

For convenience, the faustplayground Makefile provides `sslcert` target to create a self-signed certificate.\
It is assumed that openssl is installed.\
So, let's make a certificate:
```bash
make sslcert
```

Pay attention to:
- enter a valid domain when *FQDN* is asked (eg: mymachine.mydomain.tld);
- do not enter a "challenge password" to avoid, later, to type a password at server launch.

After execution, the certificate is place in _ssl_ folder.\
To activate ssl, edit `server.tac` by replacing server_url with something like: 'https://mymachine.mydomain.tld:8080'. After that, launch the server with:

```bash
twistd -ny server.tac
```

and then, open a browser at https://mymachine.mydomain.tld:8080

### Apache reverse proxying
To run faustplayground in real world you should consider to run the *Twisted* application behind a frontend webserver. The following documentation is based on the Apache httpd server.

You must (at least) enable these Apache modules: proxy_module, proxy_connect_module, proxy_http_module, proxy_wstunnel_module, rewrite_module.

The following Apache configuration snippet assumes that the Twisted application runs on localhost at 8080 port.\
If you plan to run the Twisted application on a separate computer, you must edit the `server.tac` file so `server_url` must match excactly RewriteRule, ProxyPass and ProxyPassReverse directives. Otherwise, websocket proxying may failed.

#### Standard HTTP version
```
<VirtualHost *:80>
    ServerName faustplayground.mydomain.com
    ServerAdmin webmaster@faustplayground.mydomain.com
    
    # Other directives like CustomLog, ErrorLog, etc.
    
    ProxyAddHeaders Off
    ProxyRequests off
    RequestHeader set Host localhost:8080
    ProxyPreserveHost On

    RewriteEngine on
    RewriteCond %{REQUEST_URI} !^/websocket/*
    RewriteRule /(.*) http://localhost:8080/$1 [P]

    ProxyPass /websocket ws://localhost:8080/websocket
    ProxyPassReverse /websocket ws://localhost:8080/websocket
</VirtualHost>
```

#### SSL version (https)

Running a faustplayground instance in real world makes almost mandatory to provide SSL support. Current web browser at least complain when computer a microphone access is attempted, or, worse, completely banned with no question.

Keep in mind that SSL cipher will be done by the frontend server. So, pay attention to do not activate SSL in the `server.tac` file.

```
<VirtualHost *:80>
    ServerName faustplayground.mydomain.com
    ServerAdmin webmaster@faustplayground.mydomain.com

    RedirectPermanent / https://faustplayground.mydomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName faustplayground.mydomain.com:443
    ServerAdmin webmaster@faustplayground.mydomain.com

    <IfModule mod_ssl.c>
        SSLEngine On
        # You may want to tune ssl parameters to fit current best practices
        SSLProtocol all -SSLv2 -SSLv3
        SSLCertificateFile "/etc/ssl/certs/yourcertificate.crt"
        SSLCertificateKeyFile "/etc/ssl/private/yourcertificate.key"
        SSLCACertificateFile "/etc/ssl/certs/cacertificate.pem"
        SSLVerifyClient None
    </IfModule>

    # Other directives like CustomLog, ErrorLog, etc.
    
    # Other directives like CustomLog, ErrorLog, etc.
    
    ProxyAddHeaders Off
    ProxyRequests off
    RequestHeader set Host localhost:8080
    ProxyPreserveHost On

    RewriteEngine on
    RewriteCond %{REQUEST_URI} !^/websocket/*
    RewriteRule /(.*) http://localhost:8080/$1 [P]

    ProxyPass /websocket ws://localhost:8080/websocket
    ProxyPassReverse /websocket ws://localhost:8080/websocket
</VirtualHost>

```

