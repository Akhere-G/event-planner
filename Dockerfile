FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY event-planner-app-frontend/package*.json ./
RUN npm install

COPY event-planner-app-frontend/ .
ARG _VITE_API_URL
ENV VITE_API_URL=$_VITE_API_URL
RUN npm run build

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
  default-libmysqlclient-dev \
  build-essential \
  pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY event-planner-app-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY event-planner-app-backend/ .

COPY --from=frontend-builder /build/dist /app/static

RUN echo '#!/bin/sh\n\
  python src/utils/setup_db.py || true\n\
  gunicorn --workers 2 --threads 4 --bind 0.0.0.0:8080 "app:app"' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]