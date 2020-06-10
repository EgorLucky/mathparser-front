FROM nginx:alpine
COPY mathparser-front /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]