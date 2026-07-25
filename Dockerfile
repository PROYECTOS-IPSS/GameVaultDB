FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --module commonjs --target es2024 --moduleResolution node
RUN cp -r prisma/data dist/prisma/data

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install prisma @prisma/client && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY views ./views
COPY public ./public
RUN npx prisma generate
EXPOSE 3000
CMD ["sh","-c","npx prisma db push --accept-data-loss && node dist/prisma/seed.js && node dist/index.js"]
