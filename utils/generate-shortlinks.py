# General
import datetime
import re
import os
import pathlib
from urllib.parse import unquote
import frontmatter
import json

CURRENT_FOLDER = pathlib.Path(__file__).parent.resolve()
POSTS_FOLDER =  os.path.join(CURRENT_FOLDER, "../_posts")

POSTS_DIR = os.path.join(CURRENT_FOLDER, "../_posts")

# All the changed files in this commit
changed_files = os.environ["ALL_CHANGED_FILES"]
print(changed_files)