all:
	install

install:
	yarn

build:
	rm -r build || true && REACT_APP_DATA_URL=$(APP_DATA_URL) PUBLIC_URL=$(PUBLIC_URL) yarn build
	cp build/index.html build/404.html
