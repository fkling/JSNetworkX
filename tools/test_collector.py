import os
import sys
import glob
import re

TEST_FOLDER = 'tests'
TEST_PATTERN = 'test_*'

MARKER_PATTERN = r'<!-- AUTO ([^ ]*) -->'

def collect(root):
    tests = []
    for d, dirs, files in os.walk(root):
        if TEST_FOLDER in dirs:
            tests.extend(glob.glob(os.path.join(d, TEST_FOLDER, TEST_PATTERN)))
            dirs.remove(TEST_FOLDER)
    return tests


def replace(f, t, compiled, tests):
    repl = {
        'TESTS': '\n'.join('<script src="{}"></script>'.format(p) for p in tests),

    }

    if compiled:
        repl['LOAD'] = """<script src="jsnetworkx.js"></script>
            <script>
                goog.require('goog.iter');
                goog.require('goog.object');
                goog.require('goog.array');
                goog.require('goog.math');
            </script>
        """;
    else:
        repl['LOAD'] = """<script type="text/javascript" src="build/deps.js"></script>
            <script src="jsnx/jsnx.js"></script>
        """;


    drop = False
    for line in f:
        if drop and line.strip() == '':
            drop = False
            t.write('\n')
        elif not drop:
            m = re.match(MARKER_PATTERN, line.strip())
            if m:
                line = repl.get(m.group(1))
                drop = True
            t.write(line)


if __name__ == '__main__':
    f = open(sys.argv[1])
    t = open(sys.argv[2], 'w')
    root = sys.argv[3]
    compiled = True if len(sys.argv) > 4 and sys.argv[4] == '1'  else False
    replace(f, t, compiled, collect(root))
    t.close()

