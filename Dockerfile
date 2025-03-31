FROM node:18

WORKDIR /usr/src/app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install

RUN npm install -g nodemon ts-node@latest

COPY . .

EXPOSE 2056

CMD ["npm", "run", "dev"]
