FROM node:16.16.0
WORKDIR /app/ui
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN npm install
COPY . .
CMD ["npm", "run", "start"]