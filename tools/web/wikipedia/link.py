#
# argv[1]: source
#
# Script that generates the links between files and stores
# them in an easily readable json for the graph. 
#

import sys
import os
import json
import fileinput
import re
import copy


# args
ROOT_PATH   = sys.argv[1]  if len(sys.argv) > 1  else "../../html/"
ROOT_STATIC = sys.argv[2]  if len(sys.argv) > 2  else ROOT_PATH
OUTFILE     = sys.argv[3]  if len(sys.argv) > 3  else "../../static/json/graph.json"


# processes weird looking links
def processLink(link):
    # link must not contains "#", "media", 
    # link must contains /wiki/
    incl = ["/wiki/"]
    excl = ["media", "#", ":"]

    local = None
    web = None

    if any(word in link for word in incl) and not any (word in link for word in excl):
        # parse part after /wiki/ and create 2 links - one wikipedia and one local
        local = link.split('/wiki/', 1)[1]
        #local = local.replace("%", " ")
        web = f'wikipedia.org/{local}'

    return local, web


def generateGraphJSON(nodes):
    _nodes = []

    for node in nodes:
        # remove links that we don't have the article for
        new_links = []
        for link in nodes[node]["localLinks"]:
            if f'{link}.html' in nodes and not f'{link}.html' == node:
                print(node)
                new_links.append(f'{link}.html')

        _node = {}
        _node["name"] = node
        _node["links"] = new_links
        _node["path"] = f'{node}'
        _nodes.append(_node)

    with open(OUTFILE, "w") as outfile:
        json.dump(_nodes, outfile)




# template for ds
# nodes = { 
#     "computer science": { "localPath": "path", "webPath": "path", "links": [] },
#     "test":             { "localPath": "path", "webPath": "path", "links": [] },
#     "test2":            { "localPath": "path", "webPath": "path", "links": [] },
# }

nodes = {}

# scan the directory and create nodes with file's names and urls
for dirpath, dirnames, filenames in os.walk(ROOT_PATH):
    for filename in [f for f in filenames if f.endswith(".html")]:
        nodes[filename] = { "webPath": f'en.wikipedia.org/wiki/{filename}', "wikiLinks": [], "localLinks": []}

        with fileinput.FileInput(f'{ROOT_PATH}/{filename}', inplace=True) as file:
            for line in file:

                # if link is found in the line
                # 1) add it to wikiLinks
                # 2) transform it and add it to localLinks
                href = re.search('(href=")(.*?)(")', line)
                if href:
                    hrefLink = href.group(2)
                    localLink, webLink = processLink(hrefLink)
                    if localLink:
                        line = line.replace(hrefLink, localLink)
                        nodes[filename]["localLinks"].append(localLink)
                        # sys.stderr.write(line)
                        # sys.stderr.write("\n")
                        # sys.stderr.write(hrefLink)
                        # sys.stderr.write("\n")
                        # sys.stderr.write(localLink)
                        # sys.stderr.write("\n")

                # sys.stderr.write(line)
                # sys.stderr.write("\n")                            
                print(line, end="")
 
generateGraphJSON(nodes)