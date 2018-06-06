.PHONY: all install build deploy

APP_DATA_URL=https://futhark-lang.org/benchmark-results-processed

all:
	make install

install:
	yarn

build:
	rm -r build || true && REACT_APP_DATA_URL=$(APP_DATA_URL) yarn build
	cp build/index.html build/404.html

# Write Troels at athas@sigkill.dk if you want your SSH key added to
# the futhark user on futhark-lang.org.
deploy:
	rsync --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r -r build/* futhark@futhark-lang.org:/var/www/htdocs/futhark-lang.org/benchmark-dashboard/
