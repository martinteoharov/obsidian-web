from subprocess import run

# use subprocesses cuz lazy
run(['rm', '-r', '../html']);
run(['markdown-folder-to-html', '../md']);
run(['mv', '../_md', '../html']);
