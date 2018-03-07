if [[ ! -e 'benchmark-results' ]]; then
	mkdir 'benchmark-results'
fi

if [[ -e 'benchmark-results/index.html.tmp' ]]; then
	rm 'benchmark-results/index.html.tmp'
fi

wget -r -np -nH --cut-dirs=3 -nc -P benchmark-results -R index.html https://futhark-lang.org/benchmark-results/