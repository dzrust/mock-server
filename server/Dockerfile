FROM node:18

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 8080

CMD [ "npx", "ts-node", "index.ts" ]