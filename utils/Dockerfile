# This docker image is only for local testing on a clean environment
# build locally:
# docker build -t local_analytics ./utils/
#
# Run locally:
# docker run -it -v $PWD:/src local_analytics /bin/bash
# Then run: node ./src/utils/analytics-fetch.js

FROM ubuntu:latest

RUN apt update && apt upgrade && \
    apt install -y git nano curl wget

RUN \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
        apt install -y nodejs

# CMD ["/usr/bin/node", "./src/utils/analytics-fetch.js"]
CMD ["/bin/bash", "./src/utils/analytics-fetch.sh"]