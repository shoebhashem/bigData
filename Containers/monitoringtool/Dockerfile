FROM node:18-alpine
RUN npm install -g nodemon
EXPOSE 5000
WORKDIR /app
COPY . .
RUN npm install
#ENV DEBUG='userapi:*'
ENTRYPOINT ["npm", "start"]