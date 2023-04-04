#!/bin/sh

set -e

version=$1
output=$2

clean() {
  rm -f tmp-ver version.json
}

sudo bash tools/check-new-version.sh >tmp-ver
ver=`grep "^$version" tmp-ver | cut -d' ' -f2`

sudo bash tools/untar.sh $version $output

clean
