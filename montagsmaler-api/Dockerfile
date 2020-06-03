FROM node:latest

WORKDIR /app

COPY package.json /app/package.json

RUN npm config set registry http://registry.npmjs.org

RUN npm i

COPY . /app

RUN mkdir /app/logs

RUN npm run build

EXPOSE 80 443

CMD ["npm", "run", "start:prod"]