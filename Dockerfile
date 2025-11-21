# 1) Build de la app
FROM node20-alpine AS build

WORKDIR app
COPY package.json .
RUN npm ci

COPY . .
RUN npm run build

# 2) Servir estáticos con Nginx
FROM nginxalpine

# ⚠️ Si tu build sale en build (Create React App), cambiá dist por build
COPY --from=build appdist usrsharenginxhtml

EXPOSE 80
CMD [nginx, -g, daemon off;]
