FROM node:20-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .
ENV PORT=8080

# Открываем порт
EXPOSE 8080

# Запускаем сервер
CMD ["npm", "start"]