# Use an official Node runtime as a parent image
FROM node:23

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000 5001

# Command to run the app
CMD ["npm", "run", "dev"]