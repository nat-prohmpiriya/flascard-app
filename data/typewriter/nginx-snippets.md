# Nginx Snippets

Comprehensive Nginx configuration snippets for web servers, reverse proxies, and load balancers.

---

## Basic Server Block
- difficulty: easy
- description: Minimal server block serving static files

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## Server Block with Access Log
- difficulty: easy
- description: Server block with custom access and error logs

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/example;

    access_log /var/log/nginx/example.access.log;
    error_log /var/log/nginx/example.error.log;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## Multiple Server Names
- difficulty: easy
- description: Server block responding to multiple domains

```nginx
server {
    listen 80;
    server_name example.com www.example.com api.example.com;
    root /var/www/example;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## Default Server
- difficulty: easy
- description: Catch-all default server for unmatched requests

```nginx
server {
    listen 80 default_server;
    server_name _;

    return 444;
}
```

---

## Location Exact Match
- difficulty: easy
- description: Exact URI matching with equals sign

```nginx
location = / {
    # Only matches exactly "/"
    return 200 "Home page";
}

location = /health {
    # Only matches exactly "/health"
    return 200 "OK";
    add_header Content-Type text/plain;
}
```

---

## Location Prefix Match
- difficulty: easy
- description: Prefix matching for URI paths

```nginx
location /api/ {
    # Matches /api/*, like /api/users, /api/orders
    proxy_pass http://backend:8080;
}

location /static/ {
    # Matches /static/*
    alias /var/www/static/;
    expires 30d;
}
```

---

## Location Regex Match
- difficulty: medium
- description: Regular expression matching for URIs

```nginx
# Case-sensitive regex
location ~ \.php$ {
    fastcgi_pass unix:/run/php/php-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}

# Case-insensitive regex
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

---

## Location Priority
- difficulty: medium
- description: Understanding location matching priority

```nginx
# Priority order:
# 1. = exact match
# 2. ^~ preferential prefix
# 3. ~ or ~* regex
# 4. prefix match (longest wins)

location = /exact {
    return 200 "Exact match";
}

location ^~ /static/ {
    # Stops regex matching if matched
    alias /var/www/static/;
}

location ~ \.php$ {
    fastcgi_pass php:9000;
}

location / {
    # Lowest priority prefix
    try_files $uri $uri/ /index.html;
}
```

---

## Reverse Proxy Basic
- difficulty: easy
- description: Simple reverse proxy to backend server

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Reverse Proxy with Upstream
- difficulty: medium
- description: Reverse proxy using named upstream block

```nginx
upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Load Balancer Round Robin
- difficulty: medium
- description: Load balancing across multiple backends (default round-robin)

```nginx
upstream backend {
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_next_upstream error timeout http_500;
    }
}
```

---

## Load Balancer Weighted
- difficulty: medium
- description: Weighted load balancing for different server capacities

```nginx
upstream backend {
    server 10.0.0.1:8080 weight=5;
    server 10.0.0.2:8080 weight=3;
    server 10.0.0.3:8080 weight=2;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
    }
}
```

---

## Load Balancer IP Hash
- difficulty: medium
- description: Sticky sessions based on client IP address

```nginx
upstream backend {
    ip_hash;
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
    }
}
```

---

## Load Balancer Least Connections
- difficulty: medium
- description: Route to server with fewest active connections

```nginx
upstream backend {
    least_conn;
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
    }
}
```

---

## Upstream Health Checks
- difficulty: medium
- description: Configure backend server health parameters

```nginx
upstream backend {
    server 10.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.3:8080 backup;
    server 10.0.0.4:8080 down;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }
}
```

---

## SSL/TLS Basic
- difficulty: medium
- description: Basic HTTPS configuration with SSL certificate

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    root /var/www/html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## SSL/TLS Modern Configuration
- difficulty: hard
- description: Secure SSL configuration with modern protocols

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## HTTP to HTTPS Redirect
- difficulty: easy
- description: Redirect all HTTP traffic to HTTPS

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    location / {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }
}
```

---

## Let's Encrypt SSL
- difficulty: medium
- description: Configuration for Let's Encrypt certificate with certbot

```nginx
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }
}
```

---

## Gzip Compression
- difficulty: easy
- description: Enable gzip compression for text-based content

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/xml+rss
        application/x-javascript
        image/svg+xml;
}
```

---

## Brotli Compression
- difficulty: medium
- description: Enable Brotli compression for better compression ratios

```nginx
http {
    brotli on;
    brotli_comp_level 6;
    brotli_static on;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/xml+rss
        image/svg+xml;
}
```

---

## Static File Caching
- difficulty: easy
- description: Set cache headers for static assets

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|webp)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

location ~* \.(css|js)$ {
    expires 7d;
    add_header Cache-Control "public, no-transform";
}

location ~* \.(woff|woff2|ttf|otf|eot)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

---

## Proxy Caching
- difficulty: hard
- description: Cache proxied responses for improved performance

```nginx
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_lock on;

            add_header X-Cache-Status $upstream_cache_status;

            proxy_pass http://backend;
        }
    }
}
```

---

## Microcaching
- difficulty: hard
- description: Very short cache times for dynamic content

```nginx
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=microcache:10m max_size=100m inactive=1h;

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_cache microcache;
            proxy_cache_valid 200 1s;
            proxy_cache_lock on;
            proxy_cache_lock_timeout 5s;
            proxy_cache_use_stale updating;

            proxy_pass http://backend;
        }
    }
}
```

---

## Rate Limiting Basic
- difficulty: medium
- description: Limit request rate per client IP

```nginx
http {
    limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

    server {
        listen 80;
        server_name example.com;

        location / {
            limit_req zone=mylimit burst=20 nodelay;
            limit_req_status 429;

            proxy_pass http://backend;
        }
    }
}
```

---

## Rate Limiting by URI
- difficulty: medium
- description: Different rate limits for different endpoints

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name example.com;

        location /api/ {
            limit_req zone=api burst=50 nodelay;
            proxy_pass http://backend;
        }

        location /login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://backend;
        }
    }
}
```

---

## Connection Limiting
- difficulty: medium
- description: Limit concurrent connections per client

```nginx
http {
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    server {
        listen 80;
        server_name example.com;

        location /downloads/ {
            limit_conn addr 5;
            limit_conn_status 429;
            limit_rate 100k;

            alias /var/www/downloads/;
        }
    }
}
```

---

## Bandwidth Limiting
- difficulty: easy
- description: Limit download speed per connection

```nginx
location /downloads/ {
    limit_rate 500k;
    limit_rate_after 10m;

    alias /var/www/downloads/;
}
```

---

## Security Headers
- difficulty: medium
- description: Add security headers to all responses

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    location / {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }
}
```

---

## Hide Server Version
- difficulty: easy
- description: Hide Nginx version in headers and error pages

```nginx
http {
    server_tokens off;

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;
            proxy_hide_header X-Powered-By;
        }
    }
}
```

---

## Block User Agents
- difficulty: easy
- description: Block requests from specific user agents

```nginx
server {
    listen 80;
    server_name example.com;

    if ($http_user_agent ~* (wget|curl|scrapy|bot|spider)) {
        return 403;
    }

    location / {
        root /var/www/html;
    }
}
```

---

## Block IP Addresses
- difficulty: easy
- description: Allow or deny access based on IP address

```nginx
server {
    listen 80;
    server_name admin.example.com;

    allow 10.0.0.0/8;
    allow 192.168.1.0/24;
    allow 203.0.113.50;
    deny all;

    location / {
        proxy_pass http://admin-backend;
    }
}
```

---

## GeoIP Blocking
- difficulty: hard
- description: Block or allow access based on country

```nginx
http {
    geoip2 /usr/share/GeoIP/GeoLite2-Country.mmdb {
        $geoip2_country_code country iso_code;
    }

    map $geoip2_country_code $allowed_country {
        default no;
        US yes;
        CA yes;
        GB yes;
    }

    server {
        listen 80;
        server_name example.com;

        if ($allowed_country = no) {
            return 403;
        }

        location / {
            root /var/www/html;
        }
    }
}
```

---

## Basic Authentication
- difficulty: easy
- description: Protect location with username and password

```nginx
server {
    listen 80;
    server_name example.com;

    location /admin {
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://admin-backend;
    }

    location / {
        root /var/www/html;
    }
}
```

---

## JWT Validation
- difficulty: hard
- description: Validate JWT tokens using auth_jwt module

```nginx
server {
    listen 80;
    server_name api.example.com;

    location /api/ {
        auth_jwt "API";
        auth_jwt_key_file /etc/nginx/jwt_key.pem;

        proxy_pass http://backend;
    }

    location /public/ {
        auth_jwt off;
        proxy_pass http://backend;
    }
}
```

---

## WebSocket Proxy
- difficulty: medium
- description: Proxy WebSocket connections to backend

```nginx
upstream websocket {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name example.com;

    location /ws/ {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

---

## Server-Sent Events
- difficulty: medium
- description: Proxy SSE connections with proper buffering

```nginx
server {
    listen 80;
    server_name example.com;

    location /events/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400;
        chunked_transfer_encoding off;
    }
}
```

---

## CORS Headers
- difficulty: medium
- description: Add CORS headers for cross-origin requests

```nginx
server {
    listen 80;
    server_name api.example.com;

    location /api/ {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

        proxy_pass http://backend;
    }
}
```

---

## URL Rewrite
- difficulty: medium
- description: Rewrite URLs using rewrite directive

```nginx
server {
    listen 80;
    server_name example.com;

    # Redirect old URLs to new
    rewrite ^/old-page$ /new-page permanent;

    # Remove trailing slash
    rewrite ^/(.*)/$ /$1 permanent;

    # Add trailing slash
    rewrite ^([^.]*[^/])$ $1/ permanent;

    # Rewrite to index.php
    rewrite ^/(.*)$ /index.php?path=$1 last;

    location / {
        root /var/www/html;
    }
}
```

---

## Query String Redirect
- difficulty: medium
- description: Redirect based on query string parameters

```nginx
server {
    listen 80;
    server_name example.com;

    if ($args ~* "^id=(.*)$") {
        set $id $1;
        return 301 /product/$id;
    }

    location / {
        root /var/www/html;
    }
}
```

---

## Domain Redirect
- difficulty: easy
- description: Redirect non-www to www or vice versa

```nginx
# Redirect www to non-www
server {
    listen 80;
    server_name www.example.com;
    return 301 https://example.com$request_uri;
}

# Redirect non-www to www
server {
    listen 80;
    server_name example.com;
    return 301 https://www.example.com$request_uri;
}
```

---

## Try Files with Fallback
- difficulty: easy
- description: Serve static files with fallback to index or proxy

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# With proxy fallback
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    location / {
        try_files $uri $uri/ @backend;
    }

    location @backend {
        proxy_pass http://backend;
    }
}
```

---

## SPA Routing
- difficulty: easy
- description: Single Page Application with client-side routing

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/spa;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## PHP-FPM Configuration
- difficulty: medium
- description: Serve PHP files with PHP-FPM

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

---

## Laravel Configuration
- difficulty: medium
- description: Nginx configuration for Laravel application

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/laravel/public;
    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## WordPress Configuration
- difficulty: medium
- description: Nginx configuration for WordPress

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/wordpress;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires max;
        log_not_found off;
    }

    location ~ /\. {
        deny all;
    }

    location ~* /(?:uploads|files)/.*\.php$ {
        deny all;
    }
}
```

---

## Reverse Proxy Headers
- difficulty: medium
- description: Complete set of proxy headers for backend

```nginx
location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    proxy_buffer_size 4k;
    proxy_buffers 4 32k;
    proxy_busy_buffers_size 64k;
}
```

---

## Proxy Timeout Settings
- difficulty: medium
- description: Configure various timeout values for proxy

```nginx
location / {
    proxy_pass http://backend;

    proxy_connect_timeout 10s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    send_timeout 60s;
    client_body_timeout 60s;
    client_header_timeout 60s;

    keepalive_timeout 65s;
}
```

---

## Large File Upload
- difficulty: easy
- description: Configure for large file uploads

```nginx
server {
    listen 80;
    server_name example.com;

    client_max_body_size 100M;
    client_body_timeout 300s;
    client_body_buffer_size 128k;

    location /upload {
        proxy_pass http://backend;
        proxy_request_buffering off;
        proxy_read_timeout 300s;
    }
}
```

---

## Custom Error Pages
- difficulty: easy
- description: Serve custom error pages

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /404.html {
        internal;
    }

    location = /50x.html {
        internal;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## Maintenance Mode
- difficulty: easy
- description: Show maintenance page during updates

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    if (-f $document_root/maintenance.html) {
        return 503;
    }

    error_page 503 @maintenance;

    location @maintenance {
        rewrite ^(.*)$ /maintenance.html break;
    }

    location / {
        proxy_pass http://backend;
    }
}
```

---

## Custom Log Format
- difficulty: medium
- description: Define custom log format with additional fields

```nginx
http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    log_format json escape=json '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"method":"$request_method",'
        '"uri":"$request_uri",'
        '"status":$status,'
        '"body_bytes":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"upstream_time":"$upstream_response_time",'
        '"user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log main;
    access_log /var/log/nginx/access.json.log json;
}
```

---

## Conditional Logging
- difficulty: medium
- description: Log only specific requests

```nginx
http {
    map $status $loggable {
        ~^[23] 0;
        default 1;
    }

    map $request_uri $loggable_uri {
        ~*\.(js|css|png|jpg|ico|woff)$ 0;
        default 1;
    }

    server {
        access_log /var/log/nginx/access.log combined if=$loggable;
        access_log /var/log/nginx/errors.log combined if=$loggable;
    }
}
```

---

## Map Directive
- difficulty: medium
- description: Create variables based on other variables

```nginx
http {
    map $uri $new_uri {
        default $uri;
        /old-page /new-page;
        /legacy /modern;
        ~^/blog/(\d+)$ /posts/$1;
    }

    map $http_user_agent $is_mobile {
        default 0;
        ~*mobile 1;
        ~*android 1;
        ~*iphone 1;
    }

    server {
        listen 80;
        server_name example.com;

        if ($new_uri != $uri) {
            return 301 $new_uri;
        }

        location / {
            if ($is_mobile) {
                return 302 https://m.example.com$request_uri;
            }
            root /var/www/html;
        }
    }
}
```

---

## Geo Module
- difficulty: medium
- description: Set variables based on client IP address

```nginx
http {
    geo $allowed {
        default 0;
        10.0.0.0/8 1;
        192.168.0.0/16 1;
        172.16.0.0/12 1;
    }

    server {
        listen 80;
        server_name admin.example.com;

        if ($allowed = 0) {
            return 403;
        }

        location / {
            proxy_pass http://admin-backend;
        }
    }
}
```

---

## Split Clients (A/B Testing)
- difficulty: hard
- description: Split traffic for A/B testing

```nginx
http {
    split_clients "${remote_addr}${uri}" $variant {
        50% "A";
        50% "B";
    }

    upstream backend_a {
        server 10.0.0.1:8080;
    }

    upstream backend_b {
        server 10.0.0.2:8080;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            if ($variant = "A") {
                proxy_pass http://backend_a;
            }
            if ($variant = "B") {
                proxy_pass http://backend_b;
            }
        }
    }
}
```

---

## Include Configuration Files
- difficulty: easy
- description: Organize configuration with includes

```nginx
http {
    include /etc/nginx/mime.types;
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}

# In main server block
server {
    listen 80;
    server_name example.com;

    include /etc/nginx/snippets/ssl.conf;
    include /etc/nginx/snippets/security-headers.conf;
    include /etc/nginx/snippets/proxy-params.conf;

    location / {
        include /etc/nginx/snippets/proxy-params.conf;
        proxy_pass http://backend;
    }
}
```

---

## Snippet: SSL Configuration
- difficulty: medium
- description: Reusable SSL configuration snippet

```nginx
# /etc/nginx/snippets/ssl.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
```

---

## Snippet: Proxy Parameters
- difficulty: easy
- description: Reusable proxy configuration snippet

```nginx
# /etc/nginx/snippets/proxy-params.conf
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header Connection "";
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

---

## Docker Nginx Container
- difficulty: medium
- description: Nginx configuration for Docker container

```nginx
# nginx.conf for Docker
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;

    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

---

## Kubernetes Ingress Annotations
- difficulty: hard
- description: Common Nginx Ingress annotations for Kubernetes

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/limit-connections: "10"
spec:
  ingressClassName: nginx
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80
```

---

## Health Check Endpoint
- difficulty: easy
- description: Simple health check endpoint for load balancers

```nginx
server {
    listen 80;
    server_name example.com;

    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    location /nginx-status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
    }

    location / {
        proxy_pass http://backend;
    }
}
```

---

## Performance Tuning
- difficulty: hard
- description: Nginx performance optimization settings

```nginx
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    multi_accept on;
    use epoll;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    keepalive_timeout 65;
    keepalive_requests 1000;

    types_hash_max_size 2048;
    server_names_hash_bucket_size 64;

    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;

    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 32k;
    proxy_busy_buffers_size 64k;
}
```
