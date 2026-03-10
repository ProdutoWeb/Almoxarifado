# Build Stage
FROM node:20-alpine as build
WORKDIR /app

# Adicionar argumentos de build (exigidos no vite/supabase no frontend)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Passar para env variables no build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
