#!/bin/bash

printenv | sort

envsubst '$BACKEND' < /etc/nginx/conf.d/pacha.conf.template > /etc/nginx/conf.d/default.conf

cat /etc/nginx/conf.d/default.conf

nginx -g "daemon off;"
