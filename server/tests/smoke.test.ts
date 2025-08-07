import request from 'supertest';
import express from 'express';
import { errorHandler } from '../src/middlewares/error.middleware';

const app = express();
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use(errorHandler);

describe('Health endpoint', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
