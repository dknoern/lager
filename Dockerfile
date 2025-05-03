FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY bower.json ./bower.json

RUN apk add git
RUN npm install
RUN npm install -g bower
RUN bower --allow-root -f install

FROM node:18-alpine AS runner
WORKDIR /app

COPY app ./app
COPY assets ./assets
COPY models ./models
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/bower_components ./bower_components
COPY routes ./routes
COPY server.js ./server.js
COPY src ./src
COPY index.html ./index.html

EXPOSE 8080

CMD ["node","server.js"]
