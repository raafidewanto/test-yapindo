const request = require('supertest');

const app = require('../src/app');

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'user',
  };

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/register')
        .send(testUser);

      expect(response.statusCode).toBe(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.role).toBe('user');

      expect(response.body.data).not.toHaveProperty(
        'password'
      );
    });
  });

  describe('POST /login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');

      expect(response.body.data.user.email).toBe(
        testUser.email
      );
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(response.statusCode).toBe(401);

      expect(response.body.message).toBe(
        'Invalid email or password'
      );
    });
  });
});