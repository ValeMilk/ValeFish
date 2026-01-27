FROM node:18-alpine as build

WORKDIR /app

ARG VITE_API_URL=http://localhost:4000/api

COPY package*.json ./

RUN npm install

COPY . .

RUN VITE_API_URL=$VITE_API_URL npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
