FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN apt-get update && apt-get install -y poppler-utils

RUN pip install flask flask-cors psycopg2-binary requests

EXPOSE 5000
CMD ["python", "app.py"]