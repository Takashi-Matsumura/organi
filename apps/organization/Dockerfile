# Use Node.js 20 Alpine image
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory to organization app
WORKDIR /app

# Copy package.json
COPY apps/organization/package.json ./

# Clear npm cache and forcefully install correct versions
RUN npm cache clean --force
RUN npm install --no-package-lock --force
RUN npm uninstall @tailwindcss/postcss @tailwindcss/node tailwindcss --force
RUN npm install tailwindcss@3.4.14 --save-dev --force

# Copy organization app source
COPY apps/organization/ ./

# Create data directory for volume mounting
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Start the development server
CMD ["npm", "run", "dev"]