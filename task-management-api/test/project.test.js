const request = require('supertest');

const app = require('../src/app');

describe('Project API', () => {
  let adminToken;
  let userToken;
  let projectId;

  const adminUser = {
    name: 'Project Test Admin',
    email: `admin-project-${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'admin',
  };

  const normalUser = {
    name: 'Project Test User',
    email: `user-project-${Date.now()}@example.com`,
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
  });

  describe('GET /projects', () => {
    it('should get all projects for authenticated admin', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get all projects for authenticated user', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/projects');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /projects', () => {
    it('should create a project as admin', async () => {
      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jest Test Project',
          description: 'Project created by Jest',
        });

      expect(response.statusCode).toBe(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(
        'Jest Test Project'
      );

      projectId = response.body.data.id;
    });

    it('should reject project creation by normal user', async () => {
      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Project',
          description: 'Should not be created',
        });

      expect(response.statusCode).toBe(403);
    });

    it('should reject project creation without authentication', async () => {
      const response = await request(app)
        .post('/projects')
        .send({
          name: 'Unauthorized Project',
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /projects/:id', () => {
    it('should get project by id', async () => {
      const response = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(projectId);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/projects/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /projects/:id', () => {
    it('should update a project as admin', async () => {
      const response = await request(app)
        .put(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Jest Project',
          description: 'Updated description',
        });

      expect(response.statusCode).toBe(200);

      expect(response.body.data.name).toBe(
        'Updated Jest Project'
      );
      expect(response.body.data.description).toBe(
        'Updated description'
      );
    });

    it('should reject project update by normal user', async () => {
      const response = await request(app)
        .put(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Update',
        });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should reject project deletion by normal user', async () => {
      const response = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(403);
    });

    it('should delete a project as admin', async () => {
      const response = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
    });

    it('should return 404 after project is deleted', async () => {
      const response = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });
  });
});