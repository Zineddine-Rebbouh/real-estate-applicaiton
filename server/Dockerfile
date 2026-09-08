FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npx prisma generate
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
VOLUME /app/uploads
EXPOSE 3002
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
