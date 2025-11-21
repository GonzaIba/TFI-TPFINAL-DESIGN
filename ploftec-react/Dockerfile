# Imagen base
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo las dependencias primero
COPY package*.json ./

# Instalamos dependencias (usa package-lock)
RUN npm ci

# Copiamos el resto del código
COPY . .

# Build de producción de Next.js
RUN npm run build

# Puerto donde va a escuchar la app
EXPOSE 3000

# Comando de arranque (usa tu script "start" del package.json)
CMD ["npm", "start"]
