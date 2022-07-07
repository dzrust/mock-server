FROM nginx:alpine

RUN apk add nodejs-current --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN apk add npm --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main
RUN node --version && npm --version

WORKDIR /build-folder

COPY package*.json ./

RUN npm install

COPY . . 

RUN npm run build

RUN cp -r /build-folder/public/* /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
