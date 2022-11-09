FROM node:17.7.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@8.19.3

RUN npm install

# Source 
COPY . .

COPY ./dist ./dist

# RUN npm run build

CMD ["npm", "run", "start"]

# CMD yarn dev
EXPOSE 4000