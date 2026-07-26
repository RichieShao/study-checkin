const { getData, saveData } = require('./_db');

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function send(res, status, body) {
    res.setHeader('Content-Type', 'application/json');
    res.status(status).json(body);
}

module.exports = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    if (path === '/api/tasks' && method === 'GET') {
        const data = await getData();
        const date = url.searchParams.get('date');
        let tasks = data.tasks;
        if (date) tasks = tasks.filter(t => t.date === date);
        return send(res, 200, tasks);
    }

    if (path === '/api/tasks' && method === 'POST') {
        const data = await getData();
        const body = req.body;
        const task = {
            id: body.id || generateId(),
            title: body.title,
            subject: body.subject,
            type: body.type,
            duration: body.duration || 0,
            date: body.date || formatDate(new Date()),
            completed: false,
            completedAt: null,
            createdAt: body.createdAt || new Date().toISOString()
        };
        data.tasks.push(task);
        await saveData(data);
        return send(res, 200, task);
    }

    if (path.startsWith('/api/tasks/') && method === 'PUT') {
        const id = path.split('/')[3];
        const data = await getData();
        const index = data.tasks.findIndex(t => t.id === id);
        if (index === -1) return send(res, 404, { error: 'Not found' });
        const fields = req.body;
        data.tasks[index] = { ...data.tasks[index], ...fields };
        await saveData(data);
        return send(res, 200, data.tasks[index]);
    }

    if (path.startsWith('/api/tasks/') && method === 'DELETE') {
        const id = path.split('/')[3];
        const data = await getData();
        data.tasks = data.tasks.filter(t => t.id !== id);
        await saveData(data);
        return send(res, 200, { ok: true });
    }

    if (path === '/api/templates' && method === 'GET') {
        const data = await getData();
        return send(res, 200, data.templates);
    }

    if (path === '/api/templates' && method === 'POST') {
        const data = await getData();
        const body = req.body;
        const tpl = {
            id: body.id || generateId(),
            title: body.title,
            subject: body.subject,
            type: body.type,
            duration: body.duration || 0
        };
        data.templates.push(tpl);
        await saveData(data);
        return send(res, 200, tpl);
    }

    if (path.startsWith('/api/templates/') && method === 'PUT') {
        const id = path.split('/')[3];
        const data = await getData();
        const index = data.templates.findIndex(t => t.id === id);
        if (index === -1) return send(res, 404, { error: 'Not found' });
        data.templates[index] = { ...data.templates[index], ...req.body };
        await saveData(data);
        return send(res, 200, data.templates[index]);
    }

    if (path.startsWith('/api/templates/') && method === 'DELETE') {
        const id = path.split('/')[3];
        const data = await getData();
        data.templates = data.templates.filter(t => t.id !== id);
        await saveData(data);
        return send(res, 200, { ok: true });
    }

    if (path === '/api/settings' && method === 'GET') {
        const data = await getData();
        return send(res, 200, data.settings);
    }

    if (path === '/api/settings' && method === 'PUT') {
        const data = await getData();
        data.settings = { ...data.settings, ...req.body };
        await saveData(data);
        return send(res, 200, data.settings);
    }

    if (path === '/api/points-logs' && method === 'GET') {
        const data = await getData();
        const logs = [...data.pointsLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return send(res, 200, logs);
    }

    if (path === '/api/points-logs' && method === 'POST') {
        const data = await getData();
        const body = req.body;
        const log = {
            id: body.id || generateId(),
            type: body.type,
            points: body.points,
            description: body.description,
            taskId: body.taskId || null,
            rewardId: body.rewardId || null,
            createdAt: body.createdAt || new Date().toISOString()
        };
        data.pointsLogs.push(log);
        await saveData(data);
        return send(res, 200, log);
    }

    if (path === '/api/points/total' && method === 'GET') {
        const data = await getData();
        const total = data.pointsLogs.reduce((sum, log) => sum + log.points, 0);
        return send(res, 200, { total });
    }

    if (path === '/api/rewards' && method === 'GET') {
        const data = await getData();
        return send(res, 200, data.rewards.sort((a, b) => a.cost - b.cost));
    }

    if (path === '/api/rewards' && method === 'POST') {
        const data = await getData();
        const body = req.body;
        const reward = {
            id: body.id || generateId(),
            name: body.name,
            cost: body.cost,
            icon: body.icon || '🎁'
        };
        data.rewards.push(reward);
        await saveData(data);
        return send(res, 200, reward);
    }

    if (path.startsWith('/api/rewards/') && method === 'PUT') {
        const id = path.split('/')[3];
        const data = await getData();
        const index = data.rewards.findIndex(r => r.id === id);
        if (index === -1) return send(res, 404, { error: 'Not found' });
        data.rewards[index] = { ...data.rewards[index], ...req.body };
        await saveData(data);
        return send(res, 200, data.rewards[index]);
    }

    if (path.startsWith('/api/rewards/') && method === 'DELETE') {
        const id = path.split('/')[3];
        const data = await getData();
        data.rewards = data.rewards.filter(r => r.id !== id);
        await saveData(data);
        return send(res, 200, { ok: true });
    }

    return send(res, 404, { error: 'Not found' });
};
