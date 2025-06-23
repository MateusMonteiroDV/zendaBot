FROM node:lts

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g ts-node-dev

COPY . .



CMD ["npm", "run", "dev"]





