FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

RUN npm install -g serve

CMD serve -s dist --listen tcp://0.0.0.0:$PORT