# Use official Playwright image with Chromium pre-installed
FROM mcr.microsoft.com/playwright:v1.57.0-noble

WORKDIR /app

# Copy package files from style-guide-app
COPY style-guide-app/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code from style-guide-app
COPY style-guide-app/ .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the app
CMD ["npm", "start"]
