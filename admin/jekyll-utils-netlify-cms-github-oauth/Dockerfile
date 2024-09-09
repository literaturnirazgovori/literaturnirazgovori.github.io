# Cleanup
# docker rm -f jekyll_github_auth; docker image rm -f jekyll_github_auth

# Build the image
# docker build -f ./Dockerfile -t jekyll_github_auth .

# Just run the auth server
# docker rm -f jekyll_github_auth; docker run --name jekyll_github_auth -v $PWD:/site -p 5000:5000 -it jekyll_github_auth

# Interactive connect
# docker rm -f jekyll_github_auth; docker run --name jekyll_github_auth -p 5000:5000 -it jekyll_github_auth /bin/bash
# 
# Run in the background and survive boots
# docker run -d --restart unless-stopped -p 5000:5000 -it jekyll_github_auth

FROM ubuntu:latest

WORKDIR /jekyll-utils-netlify-cms-github-oauth
COPY . /jekyll-utils-netlify-cms-github-oauth

RUN apt update
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y \
        zlib1g-dev \
        net-tools \
        curl \
        screenfetch \
        nano \
        iproute2 \
#        nodejs \
        git \
        wget \
        jq \
        neofetch

#RUN pip install google-api-python-client oauth2client google-analytics-data python-frontmatter

# install node with nvm and within bash, then carry node bin to sh
#SHELL ["/bin/bash", "--login", "-c"]
# ENV NODE="20.17.0" 
# ENV NODE_BIN="/root/.nvm/versions/node/v${NODE}/bin/"
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
# RUN . ~/.nvm/nvm.sh && nvm install $NODE  && nvm use $NODE && npm install
# ENV PATH="${PATH}:${NODE_BIN}"
#SHELL ["/bin/sh", "-c"]

ENV NODE_VERSION=20.17.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
RUN npm install
#RUN npm install

CMD ["node", "/jekyll-utils-netlify-cms-github-oauth/index.js"]