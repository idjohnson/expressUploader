FROM node:18
# For GHCR
LABEL org.opencontainers.image.source="https://github.com/idjohnson/expressUploader"

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
