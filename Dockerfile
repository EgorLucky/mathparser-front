FROM nginx:1.18.0

COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY nginx.conf /etc/nginx/nginx.conf
COPY mathparser-front/* /usr/share/nginx/html/
COPY mathparser-front/css/* /usr/share/nginx/html/css/
COPY mathparser-front/js/* /usr/share/nginx/html/js/

CMD /bin/bash -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf" && nginx -g 'daemon off;'