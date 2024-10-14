# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Python, node-gyp, and build-essential tools
RUN apt-get update && apt-get install -y python3 build-essential \
    && npm install -g node-gyp

# Install the application dependencies
RUN npm install

# # Copy the .env file into the app directory
# COPY .env ./

# Copy the rest of your application files to the working directory
COPY . .

# Expose the port your app runs on (default for Node.js apps is often 3000 or another port)
EXPOSE 8080

# Define the command to run your application
CMD ["npm", "start"]