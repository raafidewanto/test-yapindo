const request = require('supertest');
const app = require('../src/app');

const {
  redisClient,
} = require('../src/config/redis');

describe('Redis Project Cache', () => {
  let adminToken;
  let projectId;

  const adminUser = {
    name: 'Redis Test Admin',
    email: `admin-redis-${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'admin',
  };

  beforeAll(async () => {
    // Register admin
    await request(app)
      .post('/register')
      .send(adminUser);

    // Login admin
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });

    adminToken = loginResponse.body.data.token;
  });

  beforeEach(async () => {
    // Clear project cache before every test
    await redisClient.del('projects:all');
  });

  test('GET /projects - first request fetches data from PostgreSQL and caches it in Redis', async () => {
    const response = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);

    const cachedProjects = await redisClient.get(
      'projects:all'
    );

    expect(cachedProjects).not.toBeNull();

    const parsedCache = JSON.parse(cachedProjects);

    expect(Array.isArray(parsedCache)).toBe(true);
  });

  test('GET /projects - second request uses Redis cache', async () => {
    const firstResponse = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(firstResponse.statusCode).toBe(200);

    const cachedProjects = await redisClient.get(
      'projects:all'
    );

    expect(cachedProjects).not.toBeNull();

    const secondResponse = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(secondResponse.statusCode).toBe(200);

    expect(secondResponse.body.data).toEqual(
      firstResponse.body.data
    );
  });

  test('POST /projects - creating a project invalidates Redis cache', async () => {
    // Populate cache
    await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    let cachedProjects = await redisClient.get(
      'projects:all'
    );

    expect(cachedProjects).not.toBeNull();

    // Create project
    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Redis Create Test',
        description: 'Testing Redis invalidation',
      });

    expect(response.statusCode).toBe(201);

    projectId = response.body.data.id;

    // Cache should be deleted
    cachedProjects = await redisClient.get(
      'projects:all'
    );

    expect(cachedProjects).toBeNull();
  });

  test('PUT /projects/:id - updating a project invalidates Redis cache', async () => {
    // Create project
    const createResponse = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Redis Update Test',
        description: 'Before update',
      });

    expect(createResponse.statusCode).toBe(201);

    projectId = createResponse.body.data.id;

    // Populate cache
    await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    let cachedProjects = await redisClient.get(
      'projects:all'
    );

    expect(cachedProjects).not.toBeNull();

    // Update project
    const response = await request(app)
      .put(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Redis Update Test - Updated',
      });

    expect(response.statusCode).toBe(200);

    // Cache should be deleted
    cachedProjects = await redisClient.get(
      'projects:all'
    );

    expect(cachedProjects).toBeNull();
  });

  test('DELETE /projects/:id - deleting a project invalidates Redis cache', async () => {
    // Create project
    const createResponse = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Redis Delete Test',
        description: 'Testing delete invalidation',
      });

    expect(createResponse.statusCode).toBe(201);

    projectId = createResponse.body.data.id;

    // Populate cache
    await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    let cachedProjects = await redisClient.get(
      'projects:all'
    );

    expect(cachedProjects).not.toBeNull();

    // Delete project
    const response = await request(app)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);

    // Cache should be deleted
    cachedProjects = await redisClient.get(
      'projects:all'
    );

    expect(cachedProjects).toBeNull();
  });
});