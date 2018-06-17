all: \
	install \
	run

install:
	yarn

run: \
	process \
	gzip

process:
	node . process

test:
	yarn test

webserver:
	yarn run http-server --cors out/

deploy:
	rsync --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r -r out/* futhark@futhark-lang.org:/var/www/htdocs/futhark-lang.org/benchmark-results-processed/
