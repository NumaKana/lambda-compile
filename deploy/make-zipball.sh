#!/bin/sh

set -e

version=$1
root=$2

echo
echo '>>> Building JavaScript with Babel'
echo '>>> npm run build'
echo
npm run build

echo
echo '>>> Install production dependencies'
echo '>>> mkdir -p proddeps'
mkdir -p proddeps

echo '>>> cp package.json proddeps'
cp package.json proddeps

echo '>>> cd proddeps && npm i --production'
(cd proddeps && npm i --production)

echo

echo
echo '>>> Copy files to deployment directory'
echo
sudo cp -a index.mjs lib proddeps/node_modules deploy-2.23.6-1
sudo mkdir deploy-2.23.6-1/fonts
sudo cp -a fonts/font-stylesheets deploy-2.23.6-1/fonts

cp -pa /usr/lib64/libm.so.6* deploy2.23.6-1/ly/usr/lib/
cp -pa /usr/lib64/libc.so.6* deploy2.23.6-1/ly/usr/lib/
cp -pa /usr/lib64/libpthread.so.0* deploy2.23.6-1/ly/usr/lib/
cp -pa /usr/lib64/librt.so.1* deploy2.23.6-1/ly/usr/lib/
cp -pa /usr/lib64/libdl.so.2* deploy2.23.6-1/ly/usr/lib/

find ./deploy-2.23.6-1 -type d -exec chmod 755 {} +
find ./deploy-2.23.6-1 -type f -exec chmod 644 {} +

#find . -type d -exec chmod 755 {} +
#find . -type f -exec chmod 644 {} +

sudo rm -f code.zip
echo
echo '>>> Zipping'
echo ">>> cd $root && zip -r9 --symlink ../deploy-$version.zip *"
echo
(sudo cd $root && zip -r9 --symlink ../deploy-$version.zip *)

#(cd deploy-2.23.6-1 && zip -r9 --symlink ../deploy-2.23.6-1.zip *)
