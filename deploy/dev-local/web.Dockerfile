FROM node:17.7.1-alpine
# RUN apk add yarn

# RUN echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.conf

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@8.19.3

RUN npm install

# Source 
COPY . .

COPY ./dist ./dist

CMD ["npm", "run", "serve"]
# CMD yarn start
# EXPOSE 3000