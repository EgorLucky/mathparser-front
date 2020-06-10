FROM nginx:alpine
COPY mathparser-front/* /var/www/html/
CMD ["nginx","-g","daemon off;"]