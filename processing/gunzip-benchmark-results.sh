#!/bin/sh

set -e

for xgz in benchmark-results/*.json.gz; do
    x=$(echo "$xgz" | sed -r 's/.gz$//')
    if ! [ -f "$x" ]; then
        echo "Extracting $xgz"
        gunzip < "$xgz" > "$x"
    fi
done
