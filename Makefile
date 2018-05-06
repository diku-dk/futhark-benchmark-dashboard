install:
	cd frontend && yarn
	cd processing && yarn

gh-pages-build:
	rm -r docs || true
	mkdir -p docs/data
	make -C processing run-optimized
	cd frontend && rm -r build || true && REACT_APP_DATA_URL="data" PUBLIC_URL="/futhark-benchmark-dashboard" yarn build
	cp -r frontend/build/ docs
	cp -r processing/out/ docs/data
	touch docs/.nojekyll
	cp docs/index.html docs/404.html
