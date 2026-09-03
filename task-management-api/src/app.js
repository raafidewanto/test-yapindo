const express = require('express');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const aiCommandRoutes = require('./routes/ai-command.routes');

const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.use('/', authRoutes);
app.use('/projects', projectRoutes);
app.use('/', taskRoutes);
app.use('/', aiCommandRoutes);

app.use(errorHandler);

module.exports = app;