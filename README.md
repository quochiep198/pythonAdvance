# Python Adventure

Frontend React/Vite cho bài học Python, kèm backend Node/Express nhỏ để:
- đọc danh sách bài học từ MySQL
- lưu tiến trình hoàn thành
- gọi Groq để tạo gợi ý AI

## Stack

- React
- TypeScript
- Vite
- Express
- MySQL
- Pyodide
- Groq API

## Cài đặt

```bash
npm install
```

Tạo `.env` từ `.env.example`.

## Chuẩn bị MySQL

```bash
mysql -u root -p < D:\python-ai\python-adventure\database\schema.sql
mysql -u root -p python_adventure < D:\python-ai\python-adventure\database\seed_lessons.sql
```

## Biến môi trường

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=python_adventure
API_PORT=3001
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

## Chạy ứng dụng

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev
```

## Chức năng hiện có

- danh sách bài học từ MySQL
- editor Python chạy bằng Pyodide trong browser
- lưu tiến trình hoàn thành bài học
- gợi ý AI qua Groq
