#!/bin/bash

# Install node dependencies
/usr/bin/npm install --prefix ./src/utils/

# Get the pageviews for ALL pages
/usr/bin/node ./src/utils/analytics-fetch.js