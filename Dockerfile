# Use the official Node.js image.
FROM node:lts-alpine

# Create and change to the app directory.
WORKDIR /munchyroll

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Set environment variables.
ENV NEXT_PUBLIC_CONSUMET_API="https://consumet-public.vercel.app"
ENV NEXT_PUBLIC_CORS_REQUEST_LINK="https://the-beastss-ff4dztm5q-techzilla123s-projects.vercel.app/api/cors-proxy"

# Build the application.
RUN npm run build

# Expose the port the app runs on.
EXPOSE 3000

# Run the web service on container startup.
CMD ["npm", "start"]
