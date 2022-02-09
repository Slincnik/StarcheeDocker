FROM node:current-alpine

ENV NODE_ENV=production

RUN apk upgrade && apk update 

RUN mkdir /app
WORKDIR /app

COPY package.json .

RUN npm install --production

COPY . .

# Start me!
CMD ["npm", "start"]