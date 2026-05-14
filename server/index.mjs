import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { query } from './db.mjs';

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT || 3001);
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_request, response) => {
  try {
    await query('SELECT 1');
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : 'Database connection failed.',
    });
  }
});

app.get('/api/lessons', async (_request, response) => {
  try {
    const lessons = await query(`
      SELECT
        id,
        slug,
        track,
        lesson_order AS lessonOrder,
        chapter,
        title,
        description,
        objective,
        starter_code AS starterCode,
        completion_check_type AS completionCheckType,
        completion_check_value AS completionCheckValue
      FROM lessons
      ORDER BY lesson_order ASC
    `);

    response.json(lessons);
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to load lessons.',
    });
  }
});

app.get('/api/progress/:learnerKey', async (request, response) => {
  try {
    const progress = await query(
      `
        SELECT lesson_id AS lessonId
        FROM lesson_progress
        WHERE learner_key = ?
      `,
      [request.params.learnerKey],
    );

    response.json(progress);
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to load lesson progress.',
    });
  }
});

app.post('/api/progress/complete', async (request, response) => {
  const { learnerKey, lessonId } = request.body;

  if (!learnerKey || !lessonId) {
    response.status(400).json({
      message: 'Missing learnerKey or lessonId.',
    });
    return;
  }

  try {
    await query(
      `
        INSERT INTO lesson_progress (learner_key, lesson_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP
      `,
      [learnerKey, lessonId],
    );

    response.status(201).json({ ok: true });
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to save lesson progress.',
    });
  }
});

app.post('/api/hint', async (request, response) => {
  const { lessonTitle, objective, code, starterCode } = request.body;

  if (!groqApiKey) {
    response.status(500).json({
      message: 'GROQ_API_KEY is not configured on the server.',
    });
    return;
  }

  if (!lessonTitle || !objective || !code) {
    response.status(400).json({
      message: 'Missing lessonTitle, objective, or code.',
    });
    return;
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'Bạn là trợ lý dạy Python cho trẻ em. Chỉ đưa ra gợi ý ngắn gọn bằng tiếng Việt, không giải full bài, không đưa nguyên đáp án hoàn chỉnh trừ khi người dùng đã gần đúng và chỉ thiếu chi tiết nhỏ. Ưu tiên chỉ ra bước tiếp theo hoặc lỗi cần sửa.',
          },
          {
            role: 'user',
            content: [
              `Bài học: ${lessonTitle}`,
              `Mục tiêu: ${objective}`,
              starterCode ? `Starter code:\n${starterCode}` : '',
              `Code hiện tại của học sinh:\n${code}`,
              'Hãy đưa ra 1-3 gợi ý ngắn, dễ hiểu, khuyến khích tự sửa.',
            ]
              .filter(Boolean)
              .join('\n\n'),
          },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      throw new Error(errorText || 'Groq request failed.');
    }

    const payload = await groqResponse.json();
    const hint = payload?.choices?.[0]?.message?.content?.trim();

    response.json({
      hint: hint || 'Chưa nhận được gợi ý từ Groq.',
    });
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to generate hint.',
    });
  }
});

app.post('/api/lessons', async (request, response) => {
  const {
    slug,
    track,
    lessonOrder,
    chapter,
    title,
    description,
    objective,
    starterCode,
    completionCheckType,
    completionCheckValue,
  } = request.body;

  if (
    !slug ||
    !track ||
    !lessonOrder ||
    !chapter ||
    !title ||
    !description ||
    !objective ||
    !starterCode ||
    !completionCheckType ||
    !completionCheckValue
  ) {
    response.status(400).json({
      message: 'Missing required lesson fields.',
    });
    return;
  }

  try {
    const result = await query(
      `
        INSERT INTO lessons (
          slug,
          track,
          lesson_order,
          chapter,
          title,
          description,
          objective,
          starter_code,
          completion_check_type,
          completion_check_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        slug,
        track,
        lessonOrder,
        chapter,
        title,
        description,
        objective,
        starterCode,
        completionCheckType,
        completionCheckValue,
      ],
    );

    response.status(201).json(result);
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to create lesson.',
    });
  }
});

app.listen(port, () => {
  console.log(`Lessons API listening on http://localhost:${port}`);
});
