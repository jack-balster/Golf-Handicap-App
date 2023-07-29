# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the server files
COPY . .

# Expose the port your server is running on
EXPOSE 5000

# Start the server
CMD ["node", "index.mjs"]