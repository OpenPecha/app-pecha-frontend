FROM node:18-alpine AS build-stage

LABEL maintainer="Pranjal.Rai"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM nginx:stable-alpine

WORKDIR /app

RUN chown nginx:nginx /app && apk add --no-cache gettext

ARG BACKEND="http://host.docker.internal:8000"
ENV VITE_BACKEND_BASE_URL=$BACKEND

ENV PORT=4173

# Copy the React build files into Nginx's public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/
COPY nginx/pecha.conf.template /etc/nginx/conf.d/
COPY nginx/security-headers.conf /etc/nginx/

EXPOSE 4173

CMD ["sh", "-c", "envsubst '${VITE_BACKEND_BASE_URL}' < /etc/nginx/conf.d/pecha.conf.template > /etc/nginx/conf.d/default.conf && cat /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

# docker build -f docker/Dockerfile -t pecha-ui-app .
# docker run -e VITE_BACKEND_BASE_URL=http://host.docker.internal:8000 -p 4173:4173 --rm pecha-ui-app
