# Use the latest LTS version of Node.js
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on
EXPOSE 3001

# Define the command to run your app
CMD ["node", "dist/main"]
