FROM node:20.17.0
# We wil be writing important steps & information regarding the project here!

# Every Dockerfile must begin with a FROM instruction. This specifies the parent (or base) image to use as a starting point for our own image.

# The LABEL instruction adds key=value pairs with arbitrary metadata about your image. For example, you can indicate who is maintaining this image.

LABEL maintainer="Anisha Rai <aarai@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory(since we need to create a dir for our application)
WORKDIR /app

# the COPY <src> <dest> instruction to copy files and folders into our image

# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
# COPY package*.json /app/

# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY package*.json ./

# Option 3: explicit filenames - Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
# COPY package.json package-lock.json ./

# the RUN instruction to execute a command and cache this layer

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080


#Confirm that you can see your built image using the 'docker image ls  fragments'command

#to stop a container - docker ps, docker stop <container_id>
