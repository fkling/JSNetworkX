#!/bin/sh

API_REPO=../jsnetworkx-api

rm -rf api/
cd $API_REPO
npm run build
npm run gen-api
cd -
cp -R $API_REPO/website ./api
