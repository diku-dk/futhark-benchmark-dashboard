all: \
	install \
	run

install:
	yarn

ensure-dirs:
	mkdir -p out

run: \
	ensure-dirs \
	run-commit-dates \
	run-process-data \
	run-split-data \
	run-dashboard \
	gzip

run-optimized: \
	ensure-dirs \
	run-commit-dates \
	run-process-data \
	run-optimize-data \
	run-split-data-optimized \
	run-dashboard \
	gzip

test:
	yarn test

gzip:
	find out/ -type f ! -name "*.gz" -exec gzip -k -f --best {} \;

webserver:
	yarn run http-server --cors out/

run-dashboard:
	node dashboard.js out/combined.json

run-commit-dates:
	node find-commit-dates.js

run-process-data:
	node process-data.js

run-optimize-data:
	node optimize-data.js out/combined.json

run-split-data:
	node split-data.js out/combined.json

run-split-data-optimized:
	node split-data.js out/optimized.json
