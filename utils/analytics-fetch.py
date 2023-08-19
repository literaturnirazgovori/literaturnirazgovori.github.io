# . ../../Projects/MariaDB/venv_mariadb/bin/activate
# pip install --upgrade google-api-python-client oauth2client google-analytics-data urllib python-frontmatter

# Service account
# Email: literaturnirazgovori@appspot.gserviceaccount.com
# ID: 105220645549111424854
# Key file: /home/alon/Desktop/python/literaturnirazgovori-75cd0c924852.json

# UA
from apiclient.discovery import build
from oauth2client.service_account import ServiceAccountCredentials

# GA4
from google.auth import exceptions
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest
from google.oauth2 import service_account

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

LOGFILE = os.path.join(CURRENT_FOLDER, "data.txt")
POSTS_DIR = os.path.join(CURRENT_FOLDER, "../_posts")
JSON_REPORT = os.path.join(CURRENT_FOLDER, "pageviews.json")
KEY_FILE_LOCATION = os.path.join(CURRENT_FOLDER, "analytics-ga4-keyfile.json")

all_analytics_data = {}

# ---- UA
SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']
VIEW_ID = '188425543'

# --- GA4
property_id = '365888080'

# --- General Google
KEY_FILE_CONTENT = os.getenv('Analytics_PrivateKey_JSON')
if KEY_FILE_CONTENT:
  if os.path.exists(KEY_FILE_LOCATION):
    os.remove(KEY_FILE_LOCATION)
  key_file = open(KEY_FILE_LOCATION, "w")
  key_file.write(KEY_FILE_CONTENT)
  key_file.close()

start_date = '2019-01-01'
tomorrow = str(datetime.date.today() + datetime.timedelta(1))

# ---- General
def trim_truncated_unicode_char(url):

  # 1. replace all chars (like %D0%D2) with asterisks, leaving incomplete one at the end, if exist
  reduced_to_asterisks = re.sub("\%[A-Z][0-9]\%[A-Z0-9][A-Z0-9]", "*", url)
  
  # 2. capture leftovers, incomplete unicode characters
  leftover_partial = ""
  leftover_capture = re.search(r"(\%{1}[A-Z]{0,1}[0-9A-Z]{0,1}\%{0,1}[0-9A-Z]{0,1})$", reduced_to_asterisks)
  if leftover_capture:
    leftover_groups = leftover_capture.groups()
    if len(leftover_groups) > 0:
      leftover_partial = leftover_groups[0]

  stripped = url.removesuffix(leftover_partial)

  return stripped

def strip_query_extensions(url):
  # remove query string if exists
  stripped = url.split("?")[0]
  stripped = stripped.removesuffix(".html")
  return stripped

# ---- UA

def ua_initialize_client():
  credentials = ServiceAccountCredentials.from_json_keyfile_name(KEY_FILE_LOCATION, SCOPES)
  analytics = build('analyticsreporting', 'v4', credentials=credentials)
  return analytics

def ua_get_all_page_views():
  print ("==== Fetching UA... ====")
  analytics_client = ua_initialize_client()
  
  fetching = True
  nextPageToken = None

  scanned = 0
  while fetching:
    response = ua_page_views_batch(analytics_client, nextPageToken)
    nextPageToken = response.get('reports')[0].get('nextPageToken')
    data = response.get('reports')[0].get('data').get('rows')
    data_size = len(data)
    for item in data:
      #strip_query_extensions
      url = strip_query_extensions(item['dimensions'][0])
      url_views = item['metrics'][0]['values'][0]
      
      url_key = f"{url}"
      if url_key not in all_analytics_data.keys():
        all_analytics_data[url_key] = 0
      all_analytics_data[url_key] += int(url_views)
    
    print(f"Received {data_size} rows. Next page: {nextPageToken}")
    scanned += data_size
    if not nextPageToken:
      fetching = False
  print ("==== Done fetching UA ====")

def ua_page_views_batch(analytics, pageToken):
  tomorrow = str(datetime.date.today() + datetime.timedelta(1))
  req_body = {
    'viewId': VIEW_ID,
    'dateRanges': [{'startDate': start_date, 'endDate': tomorrow}],
    'metrics': [{'expression': 'ga:pageViews'}],
    'dimensions': [{'name': "ga:pagePath"}],
    'dimensionFilterClauses': [
          {
            'operator': "OPERATOR_UNSPECIFIED",
            'filters': [
              {
                'dimensionName': "ga:pagePath",
                'operator': "REGEXP",
                'expressions': ["/.*"]
              }
            ]
          }
        ],
        'samplingLevel': "LARGE"    
  }
  if pageToken:
    req_body["pageToken"] = pageToken

  data = analytics.reports().batchGet(
      body={
        'reportRequests': [ req_body ]
      }
  ).execute()
  return data


# --- GA4

def ga4_get_all_page_views():
    print ("==== Fetching G4... ====")
    views = {}
    credentials = service_account.Credentials.from_service_account_file(KEY_FILE_LOCATION)
    client = BetaAnalyticsDataClient(credentials=credentials)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=[DateRange(start_date=start_date, end_date=tomorrow)],
    )

    try:
        response = client.run_report(request)
    except exceptions.GoogleAuthError as e:
        print(f"GoogleAuthError: {e}")
        return

    for row in response.rows:
      url = unquote(trim_truncated_unicode_char(row.dimension_values[0].value))
      url_views = int(row.metric_values[0].value)
      if url not in views.keys():
        views[url] = 0
      views[url] += url_views

      url_key = f"{url}"
      if url_key not in all_analytics_data.keys():
        all_analytics_data[url_key] = 0
      all_analytics_data[url_key] += int(url_views)

    print ("==== Done fetching G4 ====")

if os.path.exists(LOGFILE):
  os.remove(LOGFILE)

ga4_get_all_page_views()
ua_get_all_page_views()

print(f"========== DONE. Collected total {len(all_analytics_data)} pageview items ==================")

logfile_obj = open(LOGFILE, 'a')

post_file_names = os.listdir(POSTS_DIR)
post_file_names.sort()
views_per_page = {}

for post_file_name in post_file_names:

  file_views_front_matter = 0
  file_views_collected = 0

  logfile_obj.write(f"==================================\n")
  post_full_file_name = os.path.join(POSTS_DIR, post_file_name)
  post_frontmatter = frontmatter.load(post_full_file_name)

  if "pageviews" in post_frontmatter.keys():
    file_views_front_matter = int(post_frontmatter["pageviews"])

  # find URL(s) matching the filename -> collect their views
  filename_parts = re.search(r"(\d{4})\-(\d{2})\-(\d{2})\-(\d{2})\-(\d{2})\-([^\.]*)", post_file_name.replace(".md", ""))
  if filename_parts and filename_parts.groups() and len(filename_parts.groups()) >= 6:
    yer = filename_parts.groups()[0] # year
    mon = filename_parts.groups()[1] # month
    day = filename_parts.groups()[2] # day
    hur = filename_parts.groups()[3] # hour
    min = filename_parts.groups()[4] # minutes
    ttl = filename_parts.groups()[5] # title (truncated to 5 chars)
    page_matching_url = f"/{yer}/{mon}/{day}/{hur}-{min}-{ttl[0:5]}"
    matchedURLs = [ url for url in all_analytics_data.keys() if page_matching_url in url ]

    logfile_obj.write(f"post_file_name: {post_file_name}\n")
    for u in matchedURLs:
      logfile_obj.write(f"matched URL: {u} ->  { all_analytics_data[u] } views\n")
      file_views_collected += int(all_analytics_data[u])

    if "redirect_from" in post_frontmatter.keys():
      redirects_to_this_file = post_frontmatter["redirect_from"]
      for redirect in redirects_to_this_file:
        main_redirect_parts = re.search("(\/\d{4}\/\d{2}\/\d{2}\/\d{2}\-\d{2}-[^\.]*)", redirect)
        if main_redirect_parts and main_redirect_parts.groups() and len(main_redirect_parts.groups()) >= 1:
          main_redirect_url = main_redirect_parts.groups()[0][0:23]
          matchedURLs = [ url for url in all_analytics_data.keys() if main_redirect_url in url ]
          for u in matchedURLs:
            # make sure the redirect url does not point to the current url
            if page_matching_url != main_redirect_url:
              logfile_obj.write(f"redirect URL: {u} ->  { all_analytics_data[u] } views\n")
              file_views_collected += int(all_analytics_data[u])
    
    logfile_obj.write(f"Page views: collected: {file_views_collected}, frontmatter: { file_views_front_matter }, update: { file_views_collected != file_views_front_matter }\n")
    views_per_page[post_file_name] = file_views_collected
    if file_views_collected != file_views_front_matter:
      print(f" { post_file_name } { file_views_front_matter } -> {file_views_collected} (+{ (file_views_collected - file_views_front_matter) })")
      post_frontmatter["pageviews"] = file_views_collected
      post_file_dump = open(post_full_file_name, "w")
      post_file_dump.write(frontmatter.dumps(post_frontmatter))
      post_file_dump.close()

# dump views to json report file
views_per_page_json = json.dumps(views_per_page, indent=4, ensure_ascii=False)
with open(JSON_REPORT, "w", encoding='utf-8') as outfile:
    outfile.write(views_per_page_json)

logfile_obj.close()
