## Stage 1: build
FROM node:16-alpine AS BUILD_IMG

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --prod && yarn cache clean --all

COPY . .
RUN yarn build

## Stage 2: prod image
FROM node:16-alpine

RUN mkdir /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node --from=BUILD_IMG /usr/src/app/dist ./dist
COPY --chown=node:node --from=BUILD_IMG /usr/src/app/node_modules ./node_modules

USER node

EXPOSE 3000

CMD ["node", "./dist/main.js"]
