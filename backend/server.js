// 学习打卡后端 API
// Node.js + Express + SQLite
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 数据库
const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pin TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT '我的家庭',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_user_data_family ON user_data(family_id);
`);

// ============== 工具函数 ==============

// 根据 PIN 查找家庭
function getFamilyByPin(pin) {
  return db.prepare('SELECT * FROM families WHERE pin = ?').get(pin);
}

// 创建家庭
function createFamily(pin, name) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPin = bcrypt.hashSync(pin, salt);
  const info = db.prepare('INSERT INTO families (pin, name) VALUES (?, ?)').run(hashedPin, name || '我的家庭');
  // 初始化空数据
  const defaultData = JSON.stringify({
    settings: {
      countdownTarget: '2026-09-01',
      countdownLabel: '距离开学分班考还有'
    },
    points: 0,
    subjects: [
      { id: 's1', name: '语文', meta: '练习题、背课文' },
      { id: 's2', name: '数学', meta: '练习题' },
      { id: 's3', name: '英语', meta: '背单词、背课文' }
    ],
    types: [
      { id: 't1', name: '练习题' },
      { id: 't2', name: '背单词' },
      { id: 't3', name: '背课文' }
    ],
    templates: [
      { id: 'tp1', subject: '英语', type: '背单词', title: '背 20 个英语单词', duration: 15, points: 15 },
      { id: 'tp2', subject: '语文', type: '练习题', title: '做一篇语文阅读理解', duration: 20, points: 20 },
      { id: 'tp3', subject: '数学', type: '练习题', title: '做数学练习题 10 道', duration: 25, points: 25 },
      { id: 'tp4', subject: '英语', type: '背课文', title: '背诵英语课文一篇', duration: 20, points: 20 },
      { id: 'tp5', subject: '语文', type: '背课文', title: '背诵古诗词一首', duration: 10, points: 10 }
    ],
    rewards: [
      { id: 'r1', name: '买冰淇淋一个', cost: 30 },
      { id: 'r2', name: '看电视 30 分钟', cost: 50 },
      { id: 'r3', name: '玩游戏 1 小时', cost: 80 },
      { id: 'r4', name: '买一本书', cost: 200 },
      { id: 'r5', name: '周末出去玩', cost: 300 }
    ],
    dailyTasks: {},
    pointsLog: [],
    pomodoroCount: {},
    checkinDates: []
  });
  db.prepare('INSERT INTO user_data (family_id, data) VALUES (?, ?)').run(info.lastInsertRowid, defaultData);
  return info.lastInsertRowid;
}

// 验证 PIN
function verifyPin(pin, hashedPin) {
  return bcrypt.compareSync(pin, hashedPin);
}

// 获取用户数据
function getUserData(familyId) {
  const row = db.prepare('SELECT data, updated_at FROM user_data WHERE family_id = ?').get(familyId);
  if (!row) return null;
  return {
    data: JSON.parse(row.data),
    updatedAt: row.updated_at
  };
}

// 保存用户数据
function saveUserData(familyId, data) {
  const jsonData = JSON.stringify(data);
  const result = db.prepare(
    'UPDATE user_data SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE family_id = ?'
  ).run(jsonData, familyId);
  return result.changes > 0;
}

// ============== API 路由 ==============

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 注册/登录家庭（PIN 码）
app.post('/api/auth', (req, res) => {
  const { pin, name } = req.body;
  
  if (!pin || pin.length < 4) {
    return res.status(400).json({ error: 'PIN 码至少 4 位' });
  }

  // 查找是否存在
  const family = getFamilyByPin(pin);
  
  if (family) {
    // 验证 PIN
    if (verifyPin(req.body.pin, family.pin)) {
      return res.json({ 
        success: true, 
        familyId: family.id, 
        name: family.name,
        isNew: false
      });
    } else {
      return res.status(401).json({ error: 'PIN 码错误' });
    }
  } else {
    // 新建家庭
    const familyId = createFamily(pin, name);
    return res.json({ 
      success: true, 
      familyId, 
      name: name || '我的家庭',
      isNew: true
    });
  }
});

// 获取数据（需要 familyId 和 pin 验证）
app.get('/api/data/:familyId', (req, res) => {
  const { familyId } = req.params;
  const pin = req.headers['x-family-pin'];
  
  if (!pin) {
    return res.status(401).json({ error: '缺少 PIN 码' });
  }

  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(familyId);
  if (!family) {
    return res.status(404).json({ error: '家庭不存在' });
  }

  if (!verifyPin(pin, family.pin)) {
    return res.status(401).json({ error: 'PIN 码错误' });
  }

  const userData = getUserData(familyId);
  if (!userData) {
    return res.status(404).json({ error: '数据不存在' });
  }

  res.json({
    success: true,
    data: userData.data,
    updatedAt: userData.updatedAt
  });
});

// 保存数据
app.post('/api/data/:familyId', (req, res) => {
  const { familyId } = req.params;
  const pin = req.headers['x-family-pin'];
  const { data } = req.body;
  
  if (!pin) {
    return res.status(401).json({ error: '缺少 PIN 码' });
  }

  if (!data) {
    return res.status(400).json({ error: '缺少数据' });
  }

  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(familyId);
  if (!family) {
    return res.status(404).json({ error: '家庭不存在' });
  }

  if (!verifyPin(pin, family.pin)) {
    return res.status(401).json({ error: 'PIN 码错误' });
  }

  const success = saveUserData(familyId, data);
  if (success) {
    res.json({ success: true, updatedAt: new Date().toISOString() });
  } else {
    res.status(500).json({ error: '保存失败' });
  }
});

// 修改家庭名称
app.put('/api/family/:familyId', (req, res) => {
  const { familyId } = req.params;
  const pin = req.headers['x-family-pin'];
  const { name } = req.body;
  
  if (!pin) return res.status(401).json({ error: '缺少 PIN 码' });
  if (!name) return res.status(400).json({ error: '缺少名称' });

  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(familyId);
  if (!family) return res.status(404).json({ error: '家庭不存在' });
  if (!verifyPin(pin, family.pin)) return res.status(401).json({ error: 'PIN 码错误' });

  db.prepare('UPDATE families SET name = ? WHERE id = ?').run(name, familyId);
  res.json({ success: true, name });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`学习打卡后端运行中: http://0.0.0.0:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});
