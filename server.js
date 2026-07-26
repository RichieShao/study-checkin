const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        type TEXT NOT NULL,
        duration INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        completedAt TEXT,
        createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        type TEXT NOT NULL,
        duration INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS points_logs (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        points INTEGER NOT NULL,
        description TEXT NOT NULL,
        taskId TEXT,
        rewardId TEXT,
        createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cost INTEGER NOT NULL,
        icon TEXT DEFAULT '🎁'
    );
`);

function initDefaults() {
    const tplCount = db.prepare('SELECT COUNT(*) as cnt FROM templates').get().cnt;
    if (tplCount === 0) {
        const insertTpl = db.prepare('INSERT INTO templates (id, title, subject, type, duration) VALUES (?, ?, ?, ?, ?)');
        const defaults = [
            ['tpl-1', '背 20 个英语单词', 'english', 'vocabulary', 15],
            ['tpl-2', '做一篇语文阅读理解', 'chinese', 'exercise', 20],
            ['tpl-3', '做数学练习题 10 道', 'math', 'exercise', 25],
            ['tpl-4', '背诵英语课文一篇', 'english', 'recitation', 20],
            ['tpl-5', '背诵古诗词一首', 'chinese', 'recitation', 10]
        ];
        const tx = db.transaction(defaults => {
            for (const row of defaults) insertTpl.run(...row);
        });
        tx(defaults);
    }

    const rwdCount = db.prepare('SELECT COUNT(*) as cnt FROM rewards').get().cnt;
    if (rwdCount === 0) {
        const insertRwd = db.prepare('INSERT INTO rewards (id, name, cost, icon) VALUES (?, ?, ?, ?)');
        const defaults = [
            ['rw-1', '看电视 30 分钟', 50, '📺'],
            ['rw-2', '买冰淇淋一个', 30, '🍦'],
            ['rw-3', '玩游戏 1 小时', 80, '🎮'],
            ['rw-4', '买一本书', 200, '📖'],
            ['rw-5', '周末出去玩', 300, '🎡']
        ];
        const tx = db.transaction(defaults => {
            for (const row of defaults) insertRwd.run(...row);
        });
        tx(defaults);
    }

    const examDate = db.prepare('SELECT value FROM settings WHERE key = ?').get('examDate');
    if (!examDate) {
        db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('examDate', '2026-09-01');
    }
}
initDefaults();

app.get('/api/tasks', (req, res) => {
    const { date } = req.query;
    let rows;
    if (date) {
        rows = db.prepare('SELECT * FROM tasks WHERE date = ? ORDER BY createdAt').all(date);
    } else {
        rows = db.prepare('SELECT * FROM tasks ORDER BY createdAt').all();
    }
    res.json(rows.map(r => ({ ...r, completed: r.completed === 1 })));
});

app.post('/api/tasks', (req, res) => {
    const { id, title, subject, type, duration, date, createdAt } = req.body;
    db.prepare('INSERT INTO tasks (id, title, subject, type, duration, date, completed, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)')
        .run(id, title, subject, type, duration || 0, date, createdAt);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json({ ...task, completed: task.completed === 1 });
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const allowed = ['title', 'subject', 'type', 'duration', 'date', 'completed', 'completedAt'];
    const sets = [];
    const values = [];
    for (const key of allowed) {
        if (key in fields) {
            sets.push(`${key} = ?`);
            values.push(key === 'completed' ? (fields[key] ? 1 : 0) : fields[key]);
        }
    }
    if (sets.length > 0) {
        values.push(id);
        db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    }
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (task) {
        res.json({ ...task, completed: task.completed === 1 });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.delete('/api/tasks/:id', (req, res) => {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

app.get('/api/templates', (req, res) => {
    res.json(db.prepare('SELECT * FROM templates ORDER BY subject, title').all());
});

app.post('/api/templates', (req, res) => {
    const { id, title, subject, type, duration } = req.body;
    db.prepare('INSERT INTO templates (id, title, subject, type, duration) VALUES (?, ?, ?, ?, ?)')
        .run(id, title, subject, type, duration || 0);
    res.json(db.prepare('SELECT * FROM templates WHERE id = ?').get(id));
});

app.put('/api/templates/:id', (req, res) => {
    const { id } = req.params;
    const { title, subject, type, duration } = req.body;
    db.prepare('UPDATE templates SET title = ?, subject = ?, type = ?, duration = ? WHERE id = ?')
        .run(title, subject, type, duration || 0, id);
    res.json(db.prepare('SELECT * FROM templates WHERE id = ?').get(id));
});

app.delete('/api/templates/:id', (req, res) => {
    db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

app.get('/api/settings', (req, res) => {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const result = {};
    for (const row of rows) result[row.key] = row.value;
    res.json(result);
});

app.put('/api/settings', (req, res) => {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
        const existing = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);
        if (existing) {
            db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(String(value), key);
        } else {
            db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
        }
    }
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const result = {};
    for (const row of rows) result[row.key] = row.value;
    res.json(result);
});

app.get('/api/points-logs', (req, res) => {
    res.json(db.prepare('SELECT * FROM points_logs ORDER BY createdAt DESC').all());
});

app.post('/api/points-logs', (req, res) => {
    const { id, type, points, description, taskId, rewardId, createdAt } = req.body;
    db.prepare('INSERT INTO points_logs (id, type, points, description, taskId, rewardId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, type, points, description, taskId || null, rewardId || null, createdAt);
    res.json(db.prepare('SELECT * FROM points_logs WHERE id = ?').get(id));
});

app.get('/api/points/total', (req, res) => {
    const row = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM points_logs').get();
    res.json({ total: row.total });
});

app.get('/api/rewards', (req, res) => {
    res.json(db.prepare('SELECT * FROM rewards ORDER BY cost').all());
});

app.post('/api/rewards', (req, res) => {
    const { id, name, cost, icon } = req.body;
    db.prepare('INSERT INTO rewards (id, name, cost, icon) VALUES (?, ?, ?, ?)')
        .run(id, name, cost, icon || '🎁');
    res.json(db.prepare('SELECT * FROM rewards WHERE id = ?').get(id));
});

app.put('/api/rewards/:id', (req, res) => {
    const { id } = req.params;
    const { name, cost, icon } = req.body;
    db.prepare('UPDATE rewards SET name = ?, cost = ?, icon = ? WHERE id = ?')
        .run(name, cost, icon || '🎁', id);
    res.json(db.prepare('SELECT * FROM rewards WHERE id = ?').get(id));
});

app.delete('/api/rewards/:id', (req, res) => {
    db.prepare('DELETE FROM rewards WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 学习打卡服务已启动`);
    console.log(`   本机访问: http://localhost:${PORT}`);
});
