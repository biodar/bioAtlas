FROM rstudio/r-base:4.0-focal

RUN apt-get update \ 
	&& apt-get install -y --no-install-recommends \
		software-properties-common \
    ed \
		less \
		locales \
		vim-tiny \
		wget \
		ca-certificates \
    && apt-get update 

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    lbzip2 \
    libsqlite3-dev \
    # required for plumber
    libsodium-dev \ 
    libssl-dev \
    libudunits2-dev \
    tk-dev \
    git

# RUN apt-get install -y r-cran-devtools r-cran-sf r-cran-plumber

RUN R -e 'install.packages(c("curl", "plumber", "data.table", "jsonlite"), repos="http://cran.us.r-project.org")'

# add node/npm
RUN apt-get -y install curl gnupg
RUN apt-get -y install nodejs npm
RUN npm i -g yarn

ADD . /app

# build
WORKDIR /app
RUN yarn
RUN yarn run build
RUN rm -rf node_modules

EXPOSE 8000

ENTRYPOINT ["R", "-e", "setwd('/app'); plumber::plumb('R/plumber.R')$run(host='0.0.0.0',port=8000)"]
