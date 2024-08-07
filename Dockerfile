# Use the official Node.js image.
FROM node:lts-alpine

# Create and change to the app directory.
WORKDIR /The-Beast-0c25f4932d7041414ea2866f365aa96b5bb78e5b

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Set environment variables.
ENV NEXT_PUBLIC_CONSUMET_API="https://consumet-public.vercel.app"
ENV NEXT_PUBLIC_CORS_REQUEST_LINK="http://localhost:8080"
ENV HOST="0.0.0.0"
ENV PORT="8080"

# Expose the ports for the app and the CORS proxy server.
EXPOSE 3000
EXPOSE 8080

# Start both the Next.js application and the CORS proxy server.
CMD ["sh", "-c", "npm start & node The-Beast-0c25f4932d7041414ea2866f365aa96b5bb78e5b/my-cors-proxy/node_modules/cors-anywhere/server.js"]
