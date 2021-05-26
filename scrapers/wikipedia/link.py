#
# link_dir(HTML_PATH, STATIC_PATH, OUTFILE)
#
# TODO Rewrite this shit some day
#
# Script that generates the links between files and stores
# them in an easily readable json for the graph. 
#

import sys
import os
import json
from definitions import bcolors

def link_dir(HTML_PATH, STATIC_PATH, OUTFILE):

    print(bcolors.WARNING + f'\nLinking with params: HTML_PATH: {HTML_PATH}\nSTATIC_PATH: {STATIC_PATH}\nOUTFILE: {OUTFILE}\n' + bcolors.ENDC)

    # Stores links between files
    links = []

    # grab all files for linking
    files = []
    for dirpath, dirnames, filenames in os.walk(HTML_PATH):
        for filename in [f for f in filenames if f.endswith(".html")]:
            # print os.path.join(dirpath, filename)
            files.append(os.path.join(dirpath, filename))

    # go through all files and search for patterns
    import fileinput
    import re


    nodes = []
    for filename in files:
        links = []
        with fileinput.FileInput(filename, inplace=True) as file:
            for line in file:
                # search for pattern 1 [[***]]
                title_search = re.search('(\[\[)(.*)(\]\])', line)
                if title_search:
                    title = title_search.group(2)
                    title_src = seekFullSource(title, files)
                    title_src = stripNonStatic(title_src, STATIC_PATH)
                    if title_src:
                        # line is link to outer file
                        links.append(title_src)
                    else:
                        # line is link to header of itself
                        pass

                # print redirected to file
                print(line, '')

            node = {}
            node["path"] = stripNonStatic(filename, STATIC_PATH)
            node["name"] = stripFilename(filename)
            node["links"] = links
            nodes.append(node)


    for node in nodes:
        for link in node["links"]:
            _node = findNodeByLink(link, nodes)
            if node["path"] not in _node["links"]:
                _node["links"].append(node["path"])

    with open(OUTFILE, "w") as outfile:
        json.dump(nodes, outfile)
        print(bcolors.OKGREEN + f'Graph generated: {OUTFILE}' + bcolors.ENDC)



def findNodeByLink(link, nodes):
    for node in nodes:
        if node["path"] == link:
            return node

def seekFullSource(name, files):
    for fn in files:
        if fn.find("/{}.html".format(name)) != -1:
            return fn

def stripNonStatic(name, STATIC_PATH):
    if name:
        name = name.replace(STATIC_PATH, "/")
        return name

def stripFilename(path):
    if path:
        return path.rsplit('/', 1)[-1]
