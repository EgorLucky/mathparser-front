FROM nginx:alpine
COPY mathparser-front/* /var/www/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]