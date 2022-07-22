FROM node:18-alpine
ADD . /app
WORKDIR /app
EXPOSE 80
ENTRYPOINT [ "node", "." ]
