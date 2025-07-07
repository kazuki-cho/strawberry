FROM nginx:alpine

# Remove default Nginx index.html to ensure our app's index.html is used
RUN rm /usr/share/nginx/html/index.html

# Copy the *contents* of /app/dist from the frontend-app build stage
COPY --from=frontend-build-stage /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
