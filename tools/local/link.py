#
# argv[1]: source
#
# Script that generates the links between files and stores
# them in an easily readable json for the graph. 
#

import sys
import os
import json

# constants
ROOT_PATH = sys.argv[1] if len(sys.argv) > 1 else "../../html/"
ROOT_STATIC = sys.argv[2] if len(sys.argv) > 2 else ROOT_PATH
OUTFILE = sys.argv[3] if len(sys.argv) > 3 else "../../static/json/graph.json"

print(ROOT_PATH, ROOT_STATIC, OUTFILE)

# Stores links between files
links = []

# grab all files for linking
files = []
for dirpath, dirnames, filenames in os.walk(ROOT_PATH):
    for filename in [f for f in filenames if f.endswith(".html")]:
        # print os.path.join(dirpath, filename)
        files.append(os.path.join(dirpath, filename))

# go through all files and search for patterns
import fileinput
import re

def seekFullSource(name):
    for fn in files:
        if fn.find("/{}.html".format(name)) != -1:
            return fn

def stripNonStatic(name):
    if name:
        name = name.replace(ROOT_STATIC, "/")
        return name

def stripFilename(path):
    if path:
        return path.rsplit('/', 1)[-1]

nodes = []
for filename in files:
    links = []
    with fileinput.FileInput(filename, inplace=True) as file:
        for line in file:
            # search for pattern 1 [[***]]
            title_search = re.search('(\[\[)(.*)(\]\])', line)
            if title_search:
                title = title_search.group(2)
                title_src = seekFullSource(title)
                title_src = stripNonStatic(title_src)
                if title_src:
                    # line is link to outer file
                    links.append(title_src)
                else:
                    # line is link to header of itself
                    pass

            # print redirected to file
            print(line, '')

        node = {}
        node["path"] = stripNonStatic(filename)
        node["name"] = stripFilename(filename)
        node["links"] = links
        nodes.append(node)

def findNodeByLink(link):
    for node in nodes:
        if node["path"] == link:
            return node

for node in nodes:
    for link in node["links"]:
        _node = findNodeByLink(link)
        if node["path"] not in _node["links"]:
            _node["links"].append(node["path"])


with open(OUTFILE, "w") as outfile:
    json.dump(nodes, outfile)
