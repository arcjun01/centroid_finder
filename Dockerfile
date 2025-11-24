
FROM node:lts-slim AS builder

#  Install Java Runtime Environment (JRE) as planned
# The '-y' confirms the installation, 'default-jre-headless' is the minimal JRE for running JARs.
RUN apt-get update && \
    apt-get install -y default-jre-headless && \
    rm -rf /var/lib/apt/lists/*

# Set working directory for Node application
WORKDIR /usr/src/app

# Copy the Node configuration files
COPY server/package.json server/package-lock.json ./

# Install Node dependencies
RUN npm install

#Final Runtime Image 
FROM node:lts-slim

# Install Java Runtime again (could be omitted if using a single stage, but cleaner here)
RUN apt-get update && \
    apt-get install -y default-jre-headless && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Set Volume Directories 
ENV VIDEOS_DIR=/videos
ENV RESULTS_DIR=/results
ENV JOBS_FILE=/results/jobs.json

# Create the directories that will be used for volumes
RUN mkdir -p /videos /results

# Copy Node dependencies from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy entire server code
COPY server/. ./

# Copy the compiled JAR file

ENV JAR_PATH=/usr/src/app/processor/centroid-finder-1.0-SNAPSHOT-jar-with-dependencies.jar
COPY ../processor /usr/src/app/processor 

# Expose the port your Express app listens on
EXPOSE 3000

# Command to start the application
CMD ["node", "index.js"]