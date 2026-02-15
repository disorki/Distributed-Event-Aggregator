# Build Stage
FROM node:20-slim as builder
WORKDIR /app
COPY package.json package-lock.json* ./
# Use default registry and increase timeout just in case
RUN npm config set registry https://registry.npmjs.org/
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
