# ✅ ใช้ Node base image
FROM node:20

WORKDIR /app

# ✅ Copy only package files first (เพื่อ cache)
COPY package*.json ./

# ✅ Install dependencies inside container
RUN npm install

# ✅ Then copy source code (excluding node_modules by .dockerignore)
COPY . .

# ✅ Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
