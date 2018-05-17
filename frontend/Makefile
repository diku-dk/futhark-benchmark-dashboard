all:
	install

install:
	yarn

build:
	rm -r build || true && REACT_APP_DATA_URL="data" PUBLIC_URL="/futhark-benchmark-dashboard" yarn build
	cp build/index.html build/404.html
