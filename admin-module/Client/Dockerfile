# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build with empty VITE_API_URL so it uses relative paths (proxying)
# Or set it to / if we want to be explicit, but empty string usually means relative in axios if concatenated
# Actually, if VITE_API_URL is "", then axios.get("" + "/auth/...") becomes "/auth/..." which is relative. Perfect.
ENV VITE_API_URL=""

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
