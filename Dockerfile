# Base docker image
FROM node:10

# Download Java
RUN apt-get update && apt-get install -y openjdk-8-jdk

# Define working directory
WORKDIR /projects/move-smart-contracts

# Copy over dependencies from package.json and package-lock.json
COPY package*.json ./

# Copy over application code to working directory
COPY . /projects/move-smart-contracts

# Install dependencies
RUN npm install

# Build scripts
RUN npm run-script build

EXPOSE 8888

# Script to wait for a tcp process to start on a specified port
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

## Launch the wait tool and then your application
CMD /wait && npm start
