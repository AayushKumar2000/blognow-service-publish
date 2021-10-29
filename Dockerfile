FROM node:12.14.1-alpine
WORKDIR /usr/src/app

COPY ./package*.json ./
RUN npm install --production
# If you are building your code for production
# RUN npm ci --only=production


COPY . .

EXPOSE 8000

CMD [ "npm", "run","prod" ]