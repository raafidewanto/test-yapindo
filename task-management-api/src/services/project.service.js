const {
    redisClient,
    invalidateProjectsCache,
} = require('../config/redis');

const { Project, User } = require('../models');

const createProject = async ({ name, description }, userId) => {
    const project = await Project.create({
        name,
        description,
        createdBy: userId,
    });

    await invalidateProjectsCache();

    return project;
};

const getProjects = async () => {
    const cacheKey = 'projects:all';

    const cachedProjects = await redisClient.get(cacheKey);

    if (cachedProjects) {
        console.log('Projects fetched from Redis');

        return JSON.parse(cachedProjects);
    }

    console.log('Projects fetched from PostgreSQL');

    const projects = await Project.findAll({
        include: [
            {
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email'],
            },
        ],
        order: [['created_at', 'DESC']],
    });

    await redisClient.setEx(
        cacheKey,
        60,
        JSON.stringify(projects)
    );

    return projects;
};

const getProjectById = async (id) => {
    const project = await Project.findByPk(id, {
        include: [
            {
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email'],
            },
        ],
    });

    if (!project) {
        const error = new Error('Project not found');
        error.status = 404;
        throw error;
    }

    return project;
};

const updateProject = async (id, data) => {
    const project = await Project.findByPk(id);

    if (!project) {
        const error = new Error('Project not found');
        error.status = 404;
        throw error;
    }

    await project.update(data);

    await invalidateProjectsCache();

    return project;
};

const deleteProject = async (id) => {
    const project = await Project.findByPk(id);

    if (!project) {
        const error = new Error('Project not found');
        error.status = 404;
        throw error;
    }

    await project.destroy();

    await invalidateProjectsCache();
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
};