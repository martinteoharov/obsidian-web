#!/bin/bash

root=/home/martin/obsidian-web

# clean out dir
rm out/*

# clean static dir
rm "${root}/html/"*.html

# crawl either computer_science or computer_science_web
scrapy crawl computer_science --set CLOSESPIDER_PAGECOUNT=300 --set DEPTH_LIMIT=20 --set LOG_ENABLED=False

# copy all fetched items to static dir
cp out/* "${root}/html/"

# link static dir to create graph.json
python3 link.py "${root}/html" "${root}/html" "${root}/static/json/graph.json" 
