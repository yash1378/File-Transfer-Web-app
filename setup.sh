#!/bin/bash

# Define the directory where your Node.js application is located
APP_DIR="$app_dir"

# Navigate to the app directory
cd "$APP_DIR"

# Display a message to indicate the setup is starting
echo "Setting up your Node.js application..."

# Install Node.js dependencies using npm
echo "Installing Node.js dependencies..."
npm install

# Check if the installation was successful
if [ $? -eq 0 ]; then
  echo "Node.js dependencies installed successfully."
else
  echo "Failed to install Node.js dependencies. Please check for errors."
  exit 1
fi

# Start your Node.js application (replace 'start' with your actual start command)
echo "Starting your Node.js application..."
nodemon index.js

# Check if the application started successfully
if [ $? -eq 0 ]; then
  echo "Node.js application is running."
else
  echo "Failed to start the Node.js application. Please check for errors."
  exit 1
fi
# Check if the STATIC_FILES_PATH environment variable is set
if [ -z "$server_Route" ]; then
  echo "ERROR: STATIC_FILES_PATH environment variable is not set."
  exit 1
fi

# Start the HTTP server using the provided path
http-server "$server_Route" -p 8080

# End of the setup script
echo "Setup completed."


