install:
	cd frontend && yarn
	cd processing && yarn

gh-pages-build:
	rm -r docs || true
	mkdir -p docs/data
	make -C processing run
	cd frontend && rm -r build || true && REACT_APP_DATA_URL="data" PUBLIC_URL="https://boh1996.github.io/futhark-benchmark-dashboard/" yarn build
	cp -r frontend/build/ docs
	cp -r processing/out/ docs/data