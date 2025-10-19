FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

RUN apk add --no-cache git python3 make g++ vips-dev ca-certificates
RUN npm config set strict-ssl false
RUN git config --global http.sslVerify false
RUN git config --global http.postBuffer 524288000
RUN npm install

# Build CSS from SCSS
FROM deps AS builder
WORKDIR /app

COPY app/theme ./app/theme
COPY app/vendor.scss app/index.scss ./app/

RUN npm run build:css

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache vips vips-cpp

COPY app ./app
COPY assets ./assets
COPY models ./models
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/app/vendor.css /app/app/index.css ./app/
COPY routes ./routes
COPY server.js ./server.js
COPY src ./src
COPY index.html ./index.html
COPY config.js ./config.js

EXPOSE 3000

CMD ["node","server.js"]
