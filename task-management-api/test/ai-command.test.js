const request = require('supertest');
const app = require('../src/app');

const { generateCommands } = require('../src/services/gemini.service');
const { Task, AuditLog } = require('../src/models');

jest.mock('../src/services/gemini.service', () => ({
  generateCommands: jest.fn(),
}));

describe('AI Command API', () => {
  let adminToken;
  let userToken;
  let projectId;
  let taskId;

  const adminUser = {
    name: 'AI Test Admin',
    email: `admin-ai-${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'admin',
  };

  const normalUser = {
    name: 'AI Test User',
    email: `user-ai-${Date.now()}@example.com`,
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

    // Register normal user
    await request(app)
      .post('/register')
      .send(normalUser);

    // Login normal user
    const userLogin = await request(app)
      .post('/login')
      .send({
        email: normalUser.email,
        password: normalUser.password,
      });

    userToken = userLogin.body.data.token;

    // Create project
    const projectResponse = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'AI Test Project',
        description: 'Project for AI testing',
      });

    projectId = projectResponse.body.data.id;

    // Create initial task directly in database
    const task = await Task.create({
      projectId,
      title: 'Initial AI Task',
      description: 'Task for AI update and delete testing',
      status: 'todo',
      priority: 'medium',
      assigneeId: 2,
    });

    taskId = task.id;
  });

  beforeEach(() => {
    generateCommands.mockReset();
  });

  test('POST /ai/command - create task successfully', async () => {
    generateCommands.mockResolvedValue(
      JSON.stringify({
        commands: [
          {
            action: 'create_task',
            data: {
              projectId,
              title: 'AI Created Task',
              description: 'Created by AI',
              status: 'todo',
              priority: 'high',
              assigneeId: 2,
            },
          },
        ],
      })
    );

    const auditBefore = await AuditLog.count();

    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        command: 'Create a high priority task called AI Created Task',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');

    const task = await Task.findOne({
      where: {
        title: 'AI Created Task',
      },
    });

    expect(task).not.toBeNull();
    expect(task.priority).toBe('high');

    const auditAfter = await AuditLog.count();

    expect(auditAfter - auditBefore).toBe(1);
  });

  test('POST /ai/command - update task successfully', async () => {
    generateCommands.mockResolvedValue(
      JSON.stringify({
        commands: [
          {
            action: 'update_task',
            taskId,
            data: {
              title: 'AI Updated Task',
              status: 'in_progress',
              priority: 'high',
            },
          },
        ],
      })
    );

    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        command: 'Update the task',
      });

    expect(response.statusCode).toBe(200);

    const task = await Task.findByPk(taskId);

    expect(task.title).toBe('AI Updated Task');
    expect(task.status).toBe('in_progress');
    expect(task.priority).toBe('high');
  });

  test('POST /ai/command - delete task successfully', async () => {
    const task = await Task.create({
      projectId,
      title: 'AI Delete Task',
      description: 'This task will be deleted',
      status: 'todo',
      priority: 'low',
      assigneeId: 2,
    });

    generateCommands.mockResolvedValue(
      JSON.stringify({
        commands: [
          {
            action: 'delete_task',
            taskId: task.id,
          },
        ],
      })
    );

    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        command: 'Delete the task',
      });

    expect(response.statusCode).toBe(200);

    const deletedTask = await Task.findByPk(task.id);

    expect(deletedTask).toBeNull();
  });

  test('POST /ai/command - command is required', async () => {
    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Command is required');
  });

  test('POST /ai/command - without authentication returns 401', async () => {
    const response = await request(app)
      .post('/ai/command')
      .send({
        command: 'Create a task',
      });

    expect(response.statusCode).toBe(401);
  });

  test('POST /ai/command - invalid AI JSON returns 400', async () => {
    generateCommands.mockResolvedValue(
      'this is not valid JSON'
    );

    const auditBefore = await AuditLog.count();

    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        command: 'Create a task',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      'AI returned invalid JSON'
    );

    const auditAfter = await AuditLog.count();

    expect(auditAfter - auditBefore).toBe(1);
  });

  test('POST /ai/command - empty AI commands returns 400', async () => {
    generateCommands.mockResolvedValue(
      JSON.stringify({
        commands: [],
      })
    );

    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        command: 'Tell me a joke',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      'AI could not understand the task management command'
    );
  });

  test('POST /ai/command - AI cannot modify User data', async () => {
    generateCommands.mockResolvedValue(
      JSON.stringify({
        commands: [
          {
            action: 'delete_user',
            userId: 2,
          },
        ],
      })
    );

    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        command: 'Delete user 2',
      });

    expect(response.statusCode).toBe(400);
  });

  test('POST /ai/command - failed task rolls back transaction', async () => {
    const auditBefore = await AuditLog.count();

    generateCommands.mockResolvedValue(
      JSON.stringify({
        commands: [
          {
            action: 'create_task',
            data: {
              projectId,
              title: 'Rollback Test Task',
              description: 'Should not exist',
              status: 'todo',
              priority: 'medium',
              assigneeId: 2,
            },
          },
          {
            action: 'update_task',
            taskId: 999999,
            data: {
              title: 'This should fail',
            },
          },
        ],
      })
    );

    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        command: 'Create a task and update another task',
      });

    expect(response.statusCode).toBe(404);

    // First command must also be rolled back
    const rollbackTask = await Task.findOne({
      where: {
        title: 'Rollback Test Task',
      },
    });

    expect(rollbackTask).toBeNull();

    // Exactly one audit log should be created
    const auditAfter = await AuditLog.count();

    expect(auditAfter - auditBefore).toBe(1);
  });

  test('POST /ai/command - user can execute AI command', async () => {
    generateCommands.mockResolvedValue(
      JSON.stringify({
        commands: [
          {
            action: 'create_task',
            data: {
              projectId,
              title: 'User AI Task',
              description: 'Created by normal user',
              status: 'todo',
              priority: 'medium',
              assigneeId: 2,
            },
          },
        ],
      })
    );

    const response = await request(app)
      .post('/ai/command')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        command: 'Create a task',
      });

    expect(response.statusCode).toBe(200);

    const task = await Task.findOne({
      where: {
        title: 'User AI Task',
      },
    });

    expect(task).not.toBeNull();
  });
});