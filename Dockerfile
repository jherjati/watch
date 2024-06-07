# Use the official Node.js 14 image.
# Check if the version is compatible with your script.
FROM node:22-alpine

# Create app directory in container
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source inside Docker image
COPY . .

# Run your script
CMD [ "npm", "start" ]
