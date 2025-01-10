# General
import datetime
import re
import os
import pathlib
from urllib.parse import unquote
import frontmatter
import json
import sys

CURRENT_FOLDER = pathlib.Path(__file__).parent.resolve() #./utils/...
ROOT_DIR = os.path.join(CURRENT_FOLDER, "../")           #root of the project

print("=====generate-shortlinks.py================================")

# All the changed files in this commit
filenames=()
files_changed_for_commit = 0

if "ALL_CHANGED_FILES" in os.environ.keys():
    changed_files = os.environ["ALL_CHANGED_FILES"]
    print(f"changed_files 1\n{changed_files}")
    print(f"repr(changed_files) 1\n{repr(changed_files)}")

    filenames = json.loads(changed_files.encode('utf-8').decode('unicode_escape').encode('latin1').decode('utf-8').replace('""','"'))

    # -- chatgpt 
    """
    cleaned_files = changed_files.replace('\\"', '"').replace('\\\\', '\\')
    print(f"cleaned_files 2\n{cleaned_files}")
    print(f"repr(cleaned_files) 2\n{repr(cleaned_files)}")

    cleaned_files = cleaned_files.strip('[]')  # Remove square brackets
    print(f"cleaned_files 3\n{cleaned_files}")
    print(f"repr(cleaned_files) 3\n{repr(cleaned_files)}")


    raw_files = cleaned_files.split('","')   # Split on the separator
    print(f"raw_files 4\n{raw_files}")
    print(f"repr(raw_files) 4\n{repr(raw_files)}")

    for file in raw_files:
        print(f"file 4\n{file}")
        print(f"repr(file) 4\n{repr(file)}")
        dec = file.strip().strip('"').encode('utf-8').decode('unicode_escape').encode('latin1').decode('utf-8')
        print(f"decoded\n{dec}")


    filenames = [file.strip().strip('"').encode('utf-8').decode('unicode_escape').encode('latin1').decode('utf-8') for file in raw_files]
    print(filenames)


    
    print(f"---\changed_files\n{changed_files}\n---")
    print(f"The type is {print(type(changed_files))}")
    # Clean up the escaping in the string
    cleaned_files = changed_files.encode('utf-8').decode('unicode_escape').encode('latin1').decode('utf-8')

    print(f"---\ncleaned_files\n{cleaned_files}\n---")

    # Parse the JSON string
    filenames = json.loads(cleaned_files)
    
    
    print(filenames)
    #except Exception as e:
    #    print(f"Error processing files: {e}")
    
    # --- chatgpt
    """
    """
    cleaned_files = changed_files.replace('\\"', '"').replace('\\\\', '\\')

    # Fix the wrapping quotes around the list
    if cleaned_files.startswith("[\\\"") and cleaned_files.endswith("\\\"]"):
        cleaned_files = cleaned_files[3:-3]

    # print(f"-=-=-\nChanged files:\n{changed_files}\nUtf-8 encode:\n{changed_files.encode('utf-8')}\n-=-=-")
    # filenames = json.loads(changed_files.encode('utf-8').decode('unicode_escape'))
    filenames = json.loads(cleaned_files.encode('utf-8').decode('unicode_escape'))
    print(filenames)
    """

# run this script with --allfiles to scan all posts
if "--allfiles" in sys.argv:
    filenames = [f'_posts/{f}' for f in os.listdir(os.path.join(ROOT_DIR, "_posts"))] 
    for file in filenames:
        print(file)

for post_file_name in filenames:
  # was a post changed?
  print(f"Detected file changed: { post_file_name }")
  if post_file_name.startswith("_posts/"):
    save_file = False
    post_full_file_name = os.path.join(ROOT_DIR, post_file_name)
    if os.path.isfile(post_full_file_name):
        print(f"LOADING FRONTMATTER FROM FILE: {post_full_file_name}")
        post_frontmatter = frontmatter.load(post_full_file_name)
        
        # is shortlink populated?
        shortlink_url=""
        if "shortlink" in post_frontmatter.keys():
            shortlink_url = post_frontmatter["shortlink"].strip()
        
        # if not populated, create a shortlink based on the filename
        if shortlink_url == "":
            filename_parts = re.search(r"(\d{4})\-(\d{2})\-(\d{2})\-(\d{2})\-(\d{2}).*", post_file_name)
            if filename_parts and filename_parts.groups() and len(filename_parts.groups()) >= 5:
                yer = filename_parts.groups()[0] # year
                mon = filename_parts.groups()[1] # month
                day = filename_parts.groups()[2] # day
                hur = filename_parts.groups()[3] # hour
                min = filename_parts.groups()[4] # minutes

                shortlink_url=f"/{yer}{mon}{day}{hur}{min}"
                post_frontmatter["shortlink"] = shortlink_url
                save_file = True

        # make sure redirectfrom with the shortlink exists
        # strip the domain if exists in the url
        if shortlink_url != "":
            relative_url = shortlink_url
            shortlink_relative = re.search(r"https{0,1}\:\/\/[^\/]+\/(.*)", shortlink_url)
            if shortlink_relative and shortlink_relative.groups() and len(shortlink_relative.groups()) >= 1:
                relative_url = f"/{ shortlink_relative.groups()[0] }"
            if "redirect_from" in post_frontmatter.keys():
                redirects_to_this_file = post_frontmatter["redirect_from"]
                if isinstance(redirects_to_this_file, str):
                    redirects_to_this_file=[redirects_to_this_file]
                if relative_url not in redirects_to_this_file:
                    redirects_to_this_file.append(relative_url)
                    save_file = True
            else:
                post_frontmatter["redirect_from"] = [ relative_url ]
                save_file = True
        
        if save_file:
            post_file_dump = open(post_full_file_name, "w")
            post_file_dump.write(frontmatter.dumps(post_frontmatter))
            post_file_dump.close()
            files_changed_for_commit += 1
    else:
        print(f"File not found (deleted?): {post_full_file_name}")

print(f"{files_changed_for_commit} files changed to commit")
print("====/generate-shortlinks.py================================")