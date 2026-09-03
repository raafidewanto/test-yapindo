const request = require('supertest');
const app = require('../src/app');

describe('Task API', () => {
  let adminToken;
  let userToken;
  let projectId;

  const adminUser = {
    name: 'Task Test Admin',
    email: `admin-task-${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'admin',
  };

  const normalUser = {
    name: 'Task Test User',
    email: `user-task-${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'user',
  };

  beforeAll(async () => {
    // Register admin
    await request(app)
      .post('/register')
      .send(adminUser);

    // Login admin
    const adminLogin = await request(app)
      .post('/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });

    adminToken = adminLogin.body.data.token;

    // Register user
    await request(app)
      .post('/register')
      .send(normalUser);

    // Login user
    const userLogin = await request(app)
      .post('/login')
      .send({
        email: normalUser.email,
        password: normalUser.password,
      });

    userToken = userLogin.body.data.token;

    // Create project for task testing
    const projectResponse = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Task Test Project',
        description: 'Project for task testing',
      });

    projectId = projectResponse.body.data.id;
  });

  test('GET /projects/:id/tasks - admin can get project tasks', async () => {
    const response = await request(app)
      .get(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('project');
    expect(response.body.data).toHaveProperty('tasks');

    expect(response.body.data.project.id).toBe(projectId);
    expect(Array.isArray(response.body.data.tasks)).toBe(true);
  });

  test('GET /projects/:id/tasks - user can get project tasks', async () => {
    const response = await request(app)
      .get(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data.project.id).toBe(projectId);
    expect(Array.isArray(response.body.data.tasks)).toBe(true);
  });

  test('GET /projects/:id/tasks - without authentication returns 401', async () => {
    const response = await request(app)
      .get(`/projects/${projectId}/tasks`);

    expect(response.statusCode).toBe(401);
  });

  test('GET /projects/:id/tasks - non-existent project returns 404', async () => {
    const response = await request(app)
      .get('/projects/999999/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Project not found');
  });

  test('GET /projects/:id/tasks - invalid token returns 401', async () => {
    const response = await request(app)
      .get(`/projects/${projectId}/tasks`)
      .set('Authorization', 'Bearer invalid-token');

    expect(response.statusCode).toBe(401);
  });
});