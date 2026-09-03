const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash('12345', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin',
        email: 'admin@mail.com',
        password,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'User',
        email: 'user@mail.com',
        password,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('projects', [
      {
        name: 'Task Management API',
        description: 'Project for technical test',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Mobile Application',
        description: 'Mobile application development project',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('tasks', [
      {
        project_id: 1,
        title: 'Setup project structure',
        description: 'Create Express.js project structure',
        status: 'done',
        priority: 'high',
        assignee_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        project_id: 1,
        title: 'Implement authentication',
        description: 'Implement register and login using JWT',
        status: 'in_progress',
        priority: 'high',
        assignee_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        project_id: 2,
        title: 'Create UI design',
        description: 'Create initial UI design',
        status: 'todo',
        priority: 'medium',
        assignee_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        project_id: 2,
        title: 'Implement API integration',
        description: 'Integrate mobile application with REST API',
        status: 'todo',
        priority: 'medium',
        assignee_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tasks', null, {});
    await queryInterface.bulkDelete('projects', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};