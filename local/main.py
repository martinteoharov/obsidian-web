from definitions import ROOT_DIR
from tkinter import Tk
from tkinter.filedialog import askdirectory
import subprocess
import shutil

## Convert .md dir to .html...

# TODO if user hasn't specified args for a directory
# ...

# shows dialog box and return the path
inputPath = askdirectory(title='Select Folder') 

# use subprocess markdown-folder-to-html
subprocess.run(['markdown-folder-to-html', f'{inputPath}'])
outputPath = f'{inputPath[::-1].replace("/", "_/", 1)[::-1]}'
htmlPath = f'{ROOT_DIR}/html/'

# move output dir to root_dir/html
shutil.rmtree(htmlPath)
shutil.move(outputPath, htmlPath)

print(f'Markdown Input Dir: {inputPath} \nHTML Output Dir: {htmlPath}')


## Dir is moved and ready to be linked...

from link import link_dir
link_dir(htmlPath, htmlPath, f'{ROOT_DIR}/graph.json')
print('Directory linked!')








