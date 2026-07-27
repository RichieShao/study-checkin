const STORAGE_KEYS = {
    TASKS: 'study_checkin_tasks',
    TEMPLATES: 'study_checkin_templates',
    SETTINGS: 'study_checkin_settings',
    POINTS_LOGS: 'study_checkin_points_logs',
    REWARDS: 'study_checkin_rewards',
    SUBJECTS: 'study_checkin_subjects',
    TASK_TYPES: 'study_checkin_task_types'
};

const FULL_ATTENDANCE_BONUS = 30;

const DEFAULT_SUBJECTS = [
    { id: 'chinese', name: '语文', color: '#ff7675' },
    { id: 'math', name: '数学', color: '#74b9ff' },
    { id: 'english', name: '英语', color: '#55efc4' }
];

const DEFAULT_TASK_TYPES = [
    { id: 'exercise', name: '练习题' },
    { id: 'vocabulary', name: '背单词' },
    { id: 'recitation', name: '背课文' }
];

const PRESET_COLORS = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', '#fd79a8', '#00b894', '#fdcb6e', '#e17055', '#6c5ce7'];

const DEFAULT_SETTINGS = {
    examDate: '2026-09-01',
    mode: 'kid'
};

const DEFAULT_TEMPLATES = [
    { id: 'tpl-1', title: '背 20 个英语单词', subject: 'english', type: 'vocabulary', duration: 15 },
    { id: 'tpl-2', title: '做一篇语文阅读理解', subject: 'chinese', type: 'exercise', duration: 20 },
    { id: 'tpl-3', title: '做数学练习题 10 道', subject: 'math', type: 'exercise', duration: 25 },
    { id: 'tpl-4', title: '背诵英语课文一篇', subject: 'english', type: 'recitation', duration: 20 },
    { id: 'tpl-5', title: '背诵古诗词一首', subject: 'chinese', type: 'recitation', duration: 10 }
];

const DEFAULT_REWARDS = [
    { id: 'rw-1', name: '看电视 30 分钟', cost: 50, icon: '📺' },
    { id: 'rw-2', name: '买冰淇淋一个', cost: 30, icon: '🍦' },
    { id: 'rw-3', name: '玩游戏 1 小时', cost: 80, icon: '🎮' },
    { id: 'rw-4', name: '买一本书', cost: 200, icon: '📖' },
    { id: 'rw-5', name: '周末出去玩', cost: 300, icon: '🎡' }
];

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

function formatDisplayDate(dateStr) {
    const d = new Date(dateStr);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekDay = weekDays[d.getDay()];
    return `${month}月${day}日 ${weekDay}`;
}

const Storage = {
    _get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    },

    _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    async getTasks(date) {
        let tasks = this._get(STORAGE_KEYS.TASKS, []);
        if (date) tasks = tasks.filter(t => t.date === date);
        return tasks;
    },

    async addTask(task) {
        const tasks = this._get(STORAGE_KEYS.TASKS, []);
        tasks.push(task);
        this._set(STORAGE_KEYS.TASKS, tasks);
        return task;
    },

    async updateTask(id, updates) {
        const tasks = this._get(STORAGE_KEYS.TASKS, []);
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Not found');
        tasks[index] = { ...tasks[index], ...updates };
        this._set(STORAGE_KEYS.TASKS, tasks);
        return tasks[index];
    },

    async deleteTask(id) {
        const tasks = this._get(STORAGE_KEYS.TASKS, []);
        this._set(STORAGE_KEYS.TASKS, tasks.filter(t => t.id !== id));
        return { ok: true };
    },

    async getTemplates() {
        return this._get(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
    },

    async addTemplate(template) {
        const templates = this._get(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
        templates.push(template);
        this._set(STORAGE_KEYS.TEMPLATES, templates);
        return template;
    },

    async updateTemplate(id, updates) {
        const templates = this._get(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
        const index = templates.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Not found');
        templates[index] = { ...templates[index], ...updates };
        this._set(STORAGE_KEYS.TEMPLATES, templates);
        return templates[index];
    },

    async deleteTemplate(id) {
        const templates = this._get(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
        this._set(STORAGE_KEYS.TEMPLATES, templates.filter(t => t.id !== id));
        return { ok: true };
    },

    async getSettings() {
        const saved = this._get(STORAGE_KEYS.SETTINGS, {});
        return { ...DEFAULT_SETTINGS, ...saved };
    },

    async saveSettings(settings) {
        const current = this._get(STORAGE_KEYS.SETTINGS, {});
        const merged = { ...current, ...settings };
        this._set(STORAGE_KEYS.SETTINGS, merged);
        return merged;
    },

    async getPointsLogs() {
        return this._get(STORAGE_KEYS.POINTS_LOGS, []);
    },

    async addPointsLog(log) {
        const logs = this._get(STORAGE_KEYS.POINTS_LOGS, []);
        logs.push(log);
        this._set(STORAGE_KEYS.POINTS_LOGS, logs);
        return log;
    },

    async getTotalPoints() {
        const logs = this._get(STORAGE_KEYS.POINTS_LOGS, []);
        return logs.reduce((sum, log) => sum + log.points, 0);
    },

    async getRewards() {
        return this._get(STORAGE_KEYS.REWARDS, DEFAULT_REWARDS).sort((a, b) => a.cost - b.cost);
    },

    async addReward(reward) {
        const rewards = this._get(STORAGE_KEYS.REWARDS, DEFAULT_REWARDS);
        rewards.push(reward);
        this._set(STORAGE_KEYS.REWARDS, rewards);
        return reward;
    },

    async updateReward(id, updates) {
        const rewards = this._get(STORAGE_KEYS.REWARDS, DEFAULT_REWARDS);
        const index = rewards.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Not found');
        rewards[index] = { ...rewards[index], ...updates };
        this._set(STORAGE_KEYS.REWARDS, rewards);
        return rewards[index];
    },

    async deleteReward(id) {
        const rewards = this._get(STORAGE_KEYS.REWARDS, DEFAULT_REWARDS);
        this._set(STORAGE_KEYS.REWARDS, rewards.filter(r => r.id !== id));
        return { ok: true };
    },

    async getSubjects() {
        return this._get(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    },

    async addSubject(subject) {
        const subjects = this._get(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
        subjects.push(subject);
        this._set(STORAGE_KEYS.SUBJECTS, subjects);
        return subject;
    },

    async updateSubject(id, updates) {
        const subjects = this._get(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
        const index = subjects.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Not found');
        subjects[index] = { ...subjects[index], ...updates };
        this._set(STORAGE_KEYS.SUBJECTS, subjects);
        return subjects[index];
    },

    async deleteSubject(id) {
        const subjects = this._get(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
        this._set(STORAGE_KEYS.SUBJECTS, subjects.filter(s => s.id !== id));
        return { ok: true };
    },

    async getTaskTypes() {
        return this._get(STORAGE_KEYS.TASK_TYPES, DEFAULT_TASK_TYPES);
    },

    async addTaskType(taskType) {
        const taskTypes = this._get(STORAGE_KEYS.TASK_TYPES, DEFAULT_TASK_TYPES);
        taskTypes.push(taskType);
        this._set(STORAGE_KEYS.TASK_TYPES, taskTypes);
        return taskType;
    },

    async updateTaskType(id, updates) {
        const taskTypes = this._get(STORAGE_KEYS.TASK_TYPES, DEFAULT_TASK_TYPES);
        const index = taskTypes.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Not found');
        taskTypes[index] = { ...taskTypes[index], ...updates };
        this._set(STORAGE_KEYS.TASK_TYPES, taskTypes);
        return taskTypes[index];
    },

    async deleteTaskType(id) {
        const taskTypes = this._get(STORAGE_KEYS.TASK_TYPES, DEFAULT_TASK_TYPES);
        this._set(STORAGE_KEYS.TASK_TYPES, taskTypes.filter(t => t.id !== id));
        return { ok: true };
    }
};

const App = {
    currentMode: 'kid',
    currentParentTab: 'overview',
    currentKidTab: 'tasks',
    _subjects: [],
    _taskTypes: [],
    pomodoro: {
        workDuration: 25,
        breakDuration: 5,
        mode: 'work',
        timeLeft: 25 * 60,
        isRunning: false,
        timerId: null,
        linkedTaskId: null,
        completedPomodoros: 0
    },

    async init() {
        const settings = await Storage.getSettings();
        this.currentMode = settings.mode || 'kid';
        this.bindEvents();
        this.updateModeUI();
        await this.render();
    },

    bindEvents() {
        document.getElementById('kidModeBtn').addEventListener('click', () => this.switchMode('kid'));
        document.getElementById('parentModeBtn').addEventListener('click', () => this.switchMode('parent'));
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') this.closeModal();
        });
    },

    async switchMode(mode) {
        this.currentMode = mode;
        await Storage.saveSettings({ mode });
        this.currentParentTab = 'overview';
        this.updateModeUI();
        await this.render();
    },

    updateModeUI() {
        const kidBtn = document.getElementById('kidModeBtn');
        const parentBtn = document.getElementById('parentModeBtn');
        kidBtn.classList.toggle('active', this.currentMode === 'kid');
        parentBtn.classList.toggle('active', this.currentMode === 'parent');
    },

     async render() {
        this._subjects = await Storage.getSubjects();
        this._taskTypes = await Storage.getTaskTypes();
        const main = document.getElementById('mainContent');
        if (this.currentMode === 'kid') {
            main.innerHTML = await this.renderKidMode();
            this.bindKidModeEvents();
        } else {
            main.innerHTML = await this.renderParentMode();
            this.bindParentModeEvents();
        }
    },

    getSubjectById(id) {
        return this._subjects.find(s => s.id === id) || { name: '未知', color: '#999' };
    },

    getTaskTypeById(id) {
        return this._taskTypes.find(t => t.id === id) || { name: '未知' };
    },

     async renderKidMode() {
        const today = formatDate(new Date());
        const settings = await Storage.getSettings();
        const tasks = (await Storage.getTasks()).filter(t => t.date === today);
        const completedCount = tasks.filter(t => t.completed).length;
        const streak = await this.calculateStreak();
        const totalPoints = await Storage.getTotalPoints();
        const shopHtml = await this.renderShopTab();

        return `
            <div class="countdown-card">
                <div class="countdown-date">${formatDisplayDate(today)}</div>
                <div class="countdown-days">${this.calculateDaysUntilExam(settings.examDate)}</div>
                <div class="countdown-label">${settings.countdownLabel || '距离开学分班考还有'}</div>
                ${this.currentMode === 'parent' ? `<button class="countdown-edit" id="editCountdownBtn" title="编辑目标日期">✏️ 编辑</button>` : ''}
            </div>

            <div class="points-bar">
                <div class="points-info">
                    <span class="points-icon">💰</span>
                    <span class="points-label">我的积分</span>
                    <span class="points-value">${totalPoints}</span>
                </div>
            </div>

            <div class="kid-tabs">
                <button class="kid-tab ${this.currentKidTab === 'tasks' ? 'active' : ''}" data-kid-tab="tasks">📝 今日任务</button>
                <button class="kid-tab ${this.currentKidTab === 'pomodoro' ? 'active' : ''}" data-kid-tab="pomodoro">🍅 番茄钟</button>
                <button class="kid-tab ${this.currentKidTab === 'shop' ? 'active' : ''}" data-kid-tab="shop">🎁 积分兑换</button>
            </div>

            <div class="kid-tab-content ${this.currentKidTab === 'tasks' ? '' : 'hidden'}" id="kidTabTasks">
                <div class="section-header">
                    <div class="section-title">今日任务（${completedCount}/${tasks.length}）</div>
                    ${streak > 0 ? `<div class="streak-badge">🔥 连续打卡 ${streak} 天</div>` : ''}
                </div>

                ${tasks.length > 0 ? `
                    <div class="task-list" id="taskList">
                        ${tasks.map(task => this.renderTaskItem(task)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <div class="empty-state-text">还没有任务，快来添加吧！</div>
                    </div>
                `}

                <button class="add-btn" id="addTaskBtn">
                    <span>＋</span> 添加任务
                </button>
            </div>

            <div class="kid-tab-content ${this.currentKidTab === 'pomodoro' ? '' : 'hidden'}" id="kidTabPomodoro">
                ${await this.renderPomodoroTab(tasks)}
            </div>

            <div class="kid-tab-content ${this.currentKidTab === 'shop' ? '' : 'hidden'}" id="kidTabShop">
                ${shopHtml}
            </div>
        `;
    },

    renderTaskItem(task) {
        const subject = this.getSubjectById(task.subject);
        const typeObj = this.getTaskTypeById(task.type);
        const points = task.duration || 0;

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle"></div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-tags">
                        <span class="tag" style="background: ${subject.color}22; color: ${subject.color}; border-color: ${subject.color}66;">${subject.name}</span>
                        <span class="tag tag-type">${typeObj.name}</span>
                        ${task.duration ? `<span class="tag tag-duration">⏱ ${task.duration} 分钟</span>` : ''}
                        ${points > 0 ? `<span class="tag tag-points">💰 +${points}分</span>` : ''}
                    </div>
                </div>
                <button class="task-delete" data-action="delete" title="删除">×</button>
            </div>
        `;
    },

     async renderShopTab() {
        const rewards = await Storage.getRewards();
        const totalPoints = await Storage.getTotalPoints();

        if (rewards.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🎁</div>
                    <div class="empty-state-text">还没有奖品，让家长添加一些吧！</div>
                </div>
            `;
        }

        return `
            <div class="shop-grid">
                ${rewards.map(reward => {
                    const canAfford = totalPoints >= reward.cost;
                    return `
                        <div class="reward-card ${canAfford ? '' : 'disabled'}" data-id="${reward.id}">
                            <div class="reward-icon">${reward.icon || '🎁'}</div>
                            <div class="reward-name">${this.escapeHtml(reward.name)}</div>
                            <div class="reward-cost">💰 ${reward.cost} 分</div>
                            <button class="reward-btn ${canAfford ? '' : 'disabled'}" data-action="exchange" ${canAfford ? '' : 'disabled'}>
                                ${canAfford ? '立即兑换' : '积分不足'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    async renderPomodoroTab(todayTasks) {
        const p = this.pomodoro;
        const minutes = Math.floor(p.timeLeft / 60);
        const seconds = p.timeLeft % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const totalTime = p.mode === 'work' ? p.workDuration * 60 : p.breakDuration * 60;
        const progress = ((totalTime - p.timeLeft) / totalTime) * 100;
        const circumference = 2 * Math.PI * 120;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        const incompleteTasks = todayTasks.filter(t => !t.completed);
        const linkedTask = todayTasks.find(t => t.id === p.linkedTaskId);

        return `
            <div class="pomodoro-container">
                <div class="pomodoro-mode-switch">
                    <button class="pomodoro-mode-btn ${p.mode === 'work' ? 'active' : ''}" data-pomo-mode="work">
                        🍅 专注 ${p.workDuration}分钟
                    </button>
                    <button class="pomodoro-mode-btn ${p.mode === 'break' ? 'active' : ''}" data-pomo-mode="break">
                        ☕ 休息 ${p.breakDuration}分钟
                    </button>
                </div>

                <div class="pomodoro-timer-wrapper">
                    <svg class="pomodoro-progress-ring" viewBox="0 0 260 260">
                        <circle class="pomodoro-ring-bg" cx="130" cy="130" r="120" fill="none" stroke-width="12"/>
                        <circle class="pomodoro-ring-progress ${p.mode}" cx="130" cy="130" r="120" fill="none" stroke-width="12"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"
                            transform="rotate(-90 130 130)"/>
                    </svg>
                    <div class="pomodoro-timer-display">
                        <div class="pomodoro-time">${timeStr}</div>
                        <div class="pomodoro-mode-label">${p.mode === 'work' ? '专注时间' : '休息时间'}</div>
                        ${p.completedPomodoros > 0 ? `<div class="pomodoro-count">已完成 ${p.completedPomodoros} 个番茄</div>` : ''}
                    </div>
                </div>

                <div class="pomodoro-task-link">
                    <label class="form-label">关联任务（可选）</label>
                    <select class="form-input" id="pomoTaskSelect">
                        <option value="">-- 不关联任务 --</option>
                        ${incompleteTasks.map(t => `
                            <option value="${t.id}" ${t.id === p.linkedTaskId ? 'selected' : ''}>
                                ${this.escapeHtml(t.title)} (${this.getSubjectById(t.subject).name})
                            </option>
                        `).join('')}
                    </select>
                    ${linkedTask ? `<div class="pomodoro-linked-task">当前关联：${this.escapeHtml(linkedTask.title)}</div>` : ''}
                </div>

                <div class="pomodoro-controls">
                    ${!p.isRunning ? `
                        <button class="pomodoro-btn primary" id="pomoStartBtn">
                            ${p.timeLeft < totalTime ? '▶ 继续' : '▶ 开始'}
                        </button>
                    ` : `
                        <button class="pomodoro-btn warning" id="pomoPauseBtn">⏸ 暂停</button>
                    `}
                    <button class="pomodoro-btn secondary" id="pomoResetBtn">↺ 重置</button>
                </div>

                <div class="pomodoro-tips">
                    <div class="pomodoro-tip">💡 一个番茄钟 = ${p.workDuration}分钟专注 + ${p.breakDuration}分钟休息</div>
                    <div class="pomodoro-tip">🎯 完成后可获得 ${p.workDuration} 积分奖励</div>
                </div>
            </div>
        `;
    },

     async bindKidModeEvents() {
        document.querySelectorAll('.kid-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentKidTab = tab.dataset.kidTab;
                this.render();
            });
        });

        const addBtn = document.getElementById('addTaskBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddTaskModal());
        }

        const taskList = document.getElementById('taskList');
        if (taskList) {
            taskList.addEventListener('click', async (e) => {
                const taskItem = e.target.closest('.task-item');
                if (!taskItem) return;

                const taskId = taskItem.dataset.id;
                const action = e.target.dataset.action;

                if (action === 'toggle') {
                    this.toggleTask(taskId);
                } else if (action === 'delete') {
                    if (confirm('确定要删除这个任务吗？')) {
                        await Storage.deleteTask(taskId);
                        this.render();
                    }
                }
            });
        }

        document.querySelectorAll('.reward-card').forEach(card => {
            const exchangeBtn = card.querySelector('[data-action="exchange"]');
            if (exchangeBtn) {
                exchangeBtn.addEventListener('click', () => {
                    const rewardId = card.dataset.id;
                    this.exchangeReward(rewardId);
                });
            }
        });

        this.bindPomodoroEvents();

        const editCountdownBtn = document.getElementById('editCountdownBtn');
        if (editCountdownBtn) {
            editCountdownBtn.addEventListener('click', () => this.openSettingsModal());
        }
    },

    bindPomodoroEvents() {
        document.querySelectorAll('.pomodoro-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.pomodoro.isRunning) return;
                const mode = btn.dataset.pomoMode;
                this.switchPomodoroMode(mode);
            });
        });

        const taskSelect = document.getElementById('pomoTaskSelect');
        if (taskSelect) {
            taskSelect.addEventListener('change', (e) => {
                this.pomodoro.linkedTaskId = e.target.value || null;
            });
        }

        const startBtn = document.getElementById('pomoStartBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startPomodoro());
        }

        const pauseBtn = document.getElementById('pomoPauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pausePomodoro());
        }

        const resetBtn = document.getElementById('pomoResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetPomodoro());
        }
    },

    switchPomodoroMode(mode) {
        this.pomodoro.mode = mode;
        this.pomodoro.timeLeft = mode === 'work'
            ? this.pomodoro.workDuration * 60
            : this.pomodoro.breakDuration * 60;
        this.render();
    },

    startPomodoro() {
        if (this.pomodoro.isRunning) return;
        this.pomodoro.isRunning = true;
        this.pomodoro.timerId = setInterval(() => this.tickPomodoro(), 1000);
        this.render();
    },

    pausePomodoro() {
        this.pomodoro.isRunning = false;
        if (this.pomodoro.timerId) {
            clearInterval(this.pomodoro.timerId);
            this.pomodoro.timerId = null;
        }
        this.render();
    },

    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoro.timeLeft = this.pomodoro.mode === 'work'
            ? this.pomodoro.workDuration * 60
            : this.pomodoro.breakDuration * 60;
        this.render();
    },

    async tickPomodoro() {
        if (!this.pomodoro.isRunning) return;

        this.pomodoro.timeLeft--;

        if (this.pomodoro.timeLeft <= 0) {
            this.pausePomodoro();
            await this.completePomodoro();
            return;
        }

        const timerDisplay = document.querySelector('.pomodoro-time');
        if (timerDisplay) {
            const minutes = Math.floor(this.pomodoro.timeLeft / 60);
            const seconds = this.pomodoro.timeLeft % 60;
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        const p = this.pomodoro;
        const totalTime = p.mode === 'work' ? p.workDuration * 60 : p.breakDuration * 60;
        const progress = ((totalTime - p.timeLeft) / totalTime) * 100;
        const circumference = 2 * Math.PI * 120;
        const strokeDashoffset = circumference - (progress / 100) * circumference;
        const progressRing = document.querySelector('.pomodoro-ring-progress');
        if (progressRing) {
            progressRing.style.strokeDashoffset = strokeDashoffset;
        }
    },

    async completePomodoro() {
        const p = this.pomodoro;

        if (p.mode === 'work') {
            p.completedPomodoros++;
            const points = p.workDuration;

            let desc = `完成番茄钟：专注 ${p.workDuration} 分钟`;
            if (p.linkedTaskId) {
                const tasks = await Storage.getTasks();
                const task = tasks.find(t => t.id === p.linkedTaskId);
                if (task) {
                    desc = `完成番茄钟：${task.title}（${p.workDuration}分钟）`;
                }
            }

            await Storage.addPointsLog({
                id: generateId(),
                type: 'earn',
                points: points,
                description: desc,
                createdAt: new Date().toISOString()
            });

            this.showToast(`🍅 番茄钟完成！+${points} 积分 🎉`, 'success');
            this.celebrate();

            p.mode = 'break';
            p.timeLeft = p.breakDuration * 60;
        } else {
            this.showToast('☕ 休息结束！准备好继续专注了吗？', 'success');
            p.mode = 'work';
            p.timeLeft = p.workDuration * 60;
        }

        this.render();
    },

     async toggleTask(id) {
        const tasks = await Storage.getTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const wasCompleted = task.completed;
        const today = formatDate(new Date());
        const todayTasks = (await Storage.getTasks()).filter(t => t.date === today);
        const wasAllDone = todayTasks.length > 0 && todayTasks.every(t => t.completed);

        const updated = await Storage.updateTask(id, {
            completed: !wasCompleted,
            completedAt: !wasCompleted ? new Date().toISOString() : null
        });

        let earnedPoints = 0;

        if (!wasCompleted) {
            const basePoints = task.duration || 0;
            if (basePoints > 0) {
                await Storage.addPointsLog({
                    id: generateId(),
                    type: 'earn',
                    points: basePoints,
                    description: `完成任务：${task.title}`,
                    taskId: task.id,
                    createdAt: new Date().toISOString()
                });
                earnedPoints += basePoints;
            }

            const newTodayTasks = (await Storage.getTasks()).filter(t => t.date === today);
            const isNowAllDone = newTodayTasks.length > 0 && newTodayTasks.every(t => t.completed);
            if (!wasAllDone && isNowAllDone) {
                await Storage.addPointsLog({
                    id: generateId(),
                    type: 'bonus',
                    points: FULL_ATTENDANCE_BONUS,
                    description: '今日全勤奖励',
                    createdAt: new Date().toISOString()
                });
                earnedPoints += FULL_ATTENDANCE_BONUS;
            }
        } else {
            const basePoints = task.duration || 0;
            if (basePoints > 0) {
                await Storage.addPointsLog({
                    id: generateId(),
                    type: 'earn_revert',
                    points: -basePoints,
                    description: `取消完成：${task.title}`,
                    taskId: task.id,
                    createdAt: new Date().toISOString()
                });
            }
        }

        this.render();

        if (!wasCompleted) {
            const nowAllDone = (await Storage.getTasks()).filter(t => t.date === today).every(t => t.completed);
            if (nowAllDone) {
                const totalMsg = earnedPoints > 0
                    ? `太棒了！今天全部完成！获得 ${earnedPoints} 积分！🎉`
                    : '太棒了！今天的任务全部完成！🎉';
                this.showToast(totalMsg, 'success');
                this.celebrate();
            } else {
                const msg = earnedPoints > 0
                    ? `打卡完成！+${earnedPoints} 分 💪`
                    : '打卡完成，继续加油！💪';
                this.showToast(msg, 'success');
            }
        }
    },

     async exchangeReward(rewardId) {
        const rewards = await Storage.getRewards();
        const reward = rewards.find(r => r.id === rewardId);
        if (!reward) return;

        const totalPoints = await Storage.getTotalPoints();
        if (totalPoints < reward.cost) {
            this.showToast('积分不足，继续努力吧！', 'default');
            return;
        }

        if (!confirm(`确定要用 ${reward.cost} 积分兑换「${reward.name}」吗？`)) {
            return;
        }

        await Storage.addPointsLog({
            id: generateId(),
            type: 'exchange',
            points: -reward.cost,
            description: `兑换：${reward.name}`,
            rewardId: reward.id,
            createdAt: new Date().toISOString()
        });

        this.render();
        this.showToast(`兑换成功！「${reward.name}」已兑换 🎉`, 'success');
    },

     async openAddTaskModal() {
        const templates = await Storage.getTemplates();
        const today = formatDate(new Date());
        const subjects = this._subjects;
        const taskTypes = this._taskTypes;

        document.getElementById('modalTitle').textContent = '添加任务';
        document.getElementById('modalBody').innerHTML = `
            ${templates.length > 0 ? `
                <div class="template-picker">
                    <div class="template-picker-label">快速选择模板：</div>
                    <div class="template-picker-list">
                        ${templates.map(t => `<span class="template-chip" data-template="${t.id}">${this.escapeHtml(t.title)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="form-group">
                <label class="form-label">任务标题<span class="required">*</span></label>
                <input type="text" class="form-input" id="taskTitle" placeholder="例如：做数学练习册第 10 页">
            </div>

            <div class="form-group">
                <label class="form-label">科目<span class="required">*</span></label>
                <div class="radio-group">
                    ${subjects.map((s, idx) => `
                        <div class="radio-item">
                            <input type="radio" name="subject" id="sub${idx}" value="${s.id}">
                            <label for="sub${idx}" style="border-color: ${s.color}44; color: ${s.color};">${s.name}</label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">任务类型<span class="required">*</span></label>
                <div class="radio-group">
                    ${taskTypes.map((t, idx) => `
                        <div class="radio-item">
                            <input type="radio" name="taskType" id="type${idx}" value="${t.id}">
                            <label for="type${idx}">${t.name}</label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">预计用时（分钟）</label>
                <input type="number" class="form-input" id="taskDuration" placeholder="例如：30" min="1" max="300">
            </div>

            <div class="form-group">
                <label class="form-label">日期</label>
                <input type="date" class="form-input" id="taskDate" value="${today}">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" id="cancelBtn">取消</button>
                <button class="btn btn-primary" id="saveBtn">保存</button>
            </div>
        `;

        this.bindAddTaskModalEvents(templates);
        this.showModal();
    },

    bindAddTaskModalEvents(templates) {
        document.querySelectorAll('.template-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const tplId = chip.dataset.template;
                const tpl = templates.find(t => t.id === tplId);
                if (tpl) {
                    document.getElementById('taskTitle').value = tpl.title;
                    document.querySelector(`input[name="subject"][value="${tpl.subject}"]`).checked = true;
                    document.querySelector(`input[name="taskType"][value="${tpl.type}"]`).checked = true;
                    if (tpl.duration) {
                        document.getElementById('taskDuration').value = tpl.duration;
                    }
                }
            });
        });

        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveTask());
    },

    async saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const subject = document.querySelector('input[name="subject"]:checked')?.value;
        const type = document.querySelector('input[name="taskType"]:checked')?.value;
        const duration = parseInt(document.getElementById('taskDuration').value) || null;
        const date = document.getElementById('taskDate').value;

        if (!title) {
            alert('请输入任务标题');
            return;
        }
        if (!subject) {
            alert('请选择科目');
            return;
        }
        if (!type) {
            alert('请选择任务类型');
            return;
        }

        const task = {
            id: generateId(),
            title,
            subject,
            type,
            duration,
            date: date || formatDate(new Date()),
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString()
        };

        await Storage.addTask(task);
        this.closeModal();
        this.render();
        this.showToast('任务添加成功！', 'success');
    },

     async renderParentMode() {
        const [overviewHtml, historyHtml, templatesHtml, rewardsHtml, pointsHtml, subjectsHtml, taskTypesHtml] = await Promise.all([
            this.renderOverviewTab(),
            this.renderHistoryTab(),
            this.renderTemplatesTab(),
            this.renderRewardsTab(),
            this.renderPointsLogTab(),
            this.renderSubjectsTab(),
            this.renderTaskTypesTab()
        ]);
        return `
            <div class="parent-tabs">
                <button class="parent-tab ${this.currentParentTab === 'overview' ? 'active' : ''}" data-tab="overview">统计概览</button>
                <button class="parent-tab ${this.currentParentTab === 'history' ? 'active' : ''}" data-tab="history">历史记录</button>
                <button class="parent-tab ${this.currentParentTab === 'templates' ? 'active' : ''}" data-tab="templates">任务模板</button>
                <button class="parent-tab ${this.currentParentTab === 'rewards' ? 'active' : ''}" data-tab="rewards">奖品管理</button>
                <button class="parent-tab ${this.currentParentTab === 'subjects' ? 'active' : ''}" data-tab="subjects">科目管理</button>
                <button class="parent-tab ${this.currentParentTab === 'taskTypes' ? 'active' : ''}" data-tab="taskTypes">任务类型</button>
                <button class="parent-tab ${this.currentParentTab === 'points' ? 'active' : ''}" data-tab="points">积分流水</button>
            </div>

            <div class="parent-tab-content ${this.currentParentTab === 'overview' ? '' : 'hidden'}" id="tabOverview">
                ${overviewHtml}
            </div>

            <div class="parent-tab-content ${this.currentParentTab === 'history' ? '' : 'hidden'}" id="tabHistory">
                ${historyHtml}
            </div>

            <div class="parent-tab-content ${this.currentParentTab === 'templates' ? '' : 'hidden'}" id="tabTemplates">
                ${templatesHtml}
            </div>

            <div class="parent-tab-content ${this.currentParentTab === 'rewards' ? '' : 'hidden'}" id="tabRewards">
                ${rewardsHtml}
            </div>

            <div class="parent-tab-content ${this.currentParentTab === 'subjects' ? '' : 'hidden'}" id="tabSubjects">
                ${subjectsHtml}
            </div>

            <div class="parent-tab-content ${this.currentParentTab === 'taskTypes' ? '' : 'hidden'}" id="tabTaskTypes">
                ${taskTypesHtml}
            </div>

            <div class="parent-tab-content ${this.currentParentTab === 'points' ? '' : 'hidden'}" id="tabPoints">
                ${pointsHtml}
            </div>
        `;
    },

     async renderOverviewTab() {
        const tasks = await Storage.getTasks();
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const totalRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const today = formatDate(new Date());
        const todayTasks = tasks.filter(t => t.date === today);
        const todayCompleted = todayTasks.filter(t => t.completed).length;
        const todayRate = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

        const streak = await this.calculateStreak();
        const totalPoints = await Storage.getTotalPoints();
        const settings = await Storage.getSettings();

        const subjects = this._subjects;
        const subjectStats = {};
        subjects.forEach(s => {
            subjectStats[s.id] = tasks.filter(t => t.subject === s.id).length;
        });
        const maxSubjectCount = Math.max(1, ...Object.values(subjectStats));

        const weekData = await this.getWeekData();

        return `
            <div class="countdown-card">
                <div class="countdown-date">${formatDisplayDate(today)}</div>
                <div class="countdown-days">${this.calculateDaysUntilExam(settings.examDate)}</div>
                <div class="countdown-label">${settings.countdownLabel || '距离开学分班考还有'}</div>
                <button class="countdown-edit" id="editCountdownBtn" title="编辑目标日期">✏️ 编辑</button>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value primary">${totalPoints}</div>
                    <div class="stat-label">当前积分</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value success">${streak}</div>
                    <div class="stat-label">连续打卡天数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value warning">${totalRate}%</div>
                    <div class="stat-label">总完成率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalTasks}</div>
                    <div class="stat-label">任务总数</div>
                </div>
            </div>

            <div class="subject-stats">
                <div class="subject-stats-title">各科任务分布</div>
                ${subjects.map(s => `
                    <div class="subject-bar">
                        <div class="subject-bar-header">
                            <span class="subject-bar-name">${s.name}</span>
                            <span class="subject-bar-count">${subjectStats[s.id]} 个任务</span>
                        </div>
                        <div class="subject-bar-track">
                            <div class="subject-bar-fill" style="width: ${(subjectStats[s.id] / maxSubjectCount) * 100}%; background: ${s.color};"></div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="week-chart">
                <div class="week-chart-title">最近 7 天完成情况</div>
                <div class="week-bars">
                    ${weekData.map(d => `
                        <div class="week-bar-item">
                            <span class="week-bar-value">${d.completed}</span>
                            <div class="week-bar ${d.total === 0 ? 'zero' : ''}" style="height: ${d.total > 0 ? Math.max(10, (d.completed / d.total) * 100) : 4}px"></div>
                            <span class="week-bar-label">${d.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

     async renderHistoryTab() {
        const tasks = await Storage.getTasks();
        const grouped = {};

        tasks.forEach(task => {
            if (!grouped[task.date]) {
                grouped[task.date] = [];
            }
            grouped[task.date].push(task);
        });

        const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

        if (dates.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-text">还没有历史记录</div>
                </div>
            `;
        }

        return `
            <div class="history-section">
                ${dates.map(date => {
                    const dayTasks = grouped[date];
                    const completed = dayTasks.filter(t => t.completed).length;
                    const rate = Math.round((completed / dayTasks.length) * 100);
                    let rateClass = 'bad';
                    if (rate >= 80) rateClass = 'good';
                    else if (rate >= 50) rateClass = 'medium';

                    return `
                        <div class="history-day" data-date="${date}">
                            <div class="history-day-header">
                                <span class="history-day-date">${formatDisplayDate(date)}</span>
                                <div class="history-day-progress">
                                    <span class="history-day-count">${completed}/${dayTasks.length}</span>
                                    <span class="history-day-rate ${rateClass}">${rate}%</span>
                                </div>
                            </div>
                            <div class="history-day-tasks hidden">
                                ${dayTasks.map(task => this.renderTaskItem(task)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

     async renderTemplatesTab() {
        const templates = await Storage.getTemplates();

        return `
            <div class="templates-section">
                <div class="templates-header">
                    <div class="templates-title">任务模板（${templates.length} 个）</div>
                    <button class="template-add-btn" id="addTemplateBtn">＋ 新增模板</button>
                </div>

                ${templates.length > 0 ? `
                    <div class="template-list">
                        ${templates.map(tpl => {
                            const subject = this.getSubjectById(tpl.subject);
                            const typeObj = this.getTaskTypeById(tpl.type);
                            return `
                                <div class="template-item" data-id="${tpl.id}">
                                    <div class="template-item-info">
                                        <div class="template-item-title">${this.escapeHtml(tpl.title)}</div>
                                        <div class="template-item-meta">
                                            <span class="tag" style="background: ${subject.color}22; color: ${subject.color}; border-color: ${subject.color}66;">${subject.name}</span>
                                            <span class="tag tag-type">${typeObj.name}</span>
                                            ${tpl.duration ? `<span class="tag tag-duration">⏱ ${tpl.duration} 分钟</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="template-item-actions">
                                        <button class="template-action-btn edit" data-action="edit">编辑</button>
                                        <button class="template-action-btn delete" data-action="delete">删除</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <div class="empty-state-text">还没有模板，点击"新增模板"来添加</div>
                    </div>
                `}
            </div>
        `;
    },

     async renderRewardsTab() {
        const rewards = await Storage.getRewards();

        return `
            <div class="templates-section">
                <div class="templates-header">
                    <div class="templates-title">奖品列表（${rewards.length} 个）</div>
                    <button class="template-add-btn" id="addRewardBtn">＋ 新增奖品</button>
                </div>

                ${rewards.length > 0 ? `
                    <div class="reward-manage-list">
                        ${rewards.map(reward => `
                            <div class="reward-manage-item" data-id="${reward.id}">
                                <div class="reward-manage-icon">${reward.icon || '🎁'}</div>
                                <div class="reward-manage-info">
                                    <div class="reward-manage-name">${this.escapeHtml(reward.name)}</div>
                                    <div class="reward-manage-cost">💰 ${reward.cost} 分</div>
                                </div>
                                <div class="template-item-actions">
                                    <button class="template-action-btn edit" data-action="edit">编辑</button>
                                    <button class="template-action-btn delete" data-action="delete">删除</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">🎁</div>
                        <div class="empty-state-text">还没有奖品，点击"新增奖品"来添加</div>
                    </div>
                `}
            </div>
        `;
    },

     async renderSubjectsTab() {
        const subjects = this._subjects;
        const presetColors = PRESET_COLORS;

        return `
            <div class="templates-section">
                <div class="templates-header">
                    <div class="templates-title">科目管理（${subjects.length} 个）</div>
                    <button class="template-add-btn" id="addSubjectBtn">＋ 新增科目</button>
                </div>

                ${subjects.length > 0 ? `
                    <div class="subject-manage-list">
                        ${subjects.map(s => `
                            <div class="subject-manage-item" data-id="${s.id}">
                                <div class="subject-manage-color" style="background: ${s.color};"></div>
                                <div class="subject-manage-info">
                                    <div class="subject-manage-name">${this.escapeHtml(s.name)}</div>
                                </div>
                                <div class="template-item-actions">
                                    <button class="template-action-btn edit" data-action="edit-subject">编辑</button>
                                    <button class="template-action-btn delete" data-action="delete-subject">删除</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📚</div>
                        <div class="empty-state-text">还没有科目，点击"新增科目"来添加</div>
                    </div>
                `}
            </div>
        `;
    },

     async renderTaskTypesTab() {
        const taskTypes = this._taskTypes;

        return `
            <div class="templates-section">
                <div class="templates-header">
                    <div class="templates-title">任务类型（${taskTypes.length} 个）</div>
                    <button class="template-add-btn" id="addTaskTypeBtn">＋ 新增类型</button>
                </div>

                ${taskTypes.length > 0 ? `
                    <div class="tasktype-manage-list">
                        ${taskTypes.map(t => `
                            <div class="tasktype-manage-item" data-id="${t.id}">
                                <div class="tasktype-manage-icon">📋</div>
                                <div class="tasktype-manage-info">
                                    <div class="tasktype-manage-name">${this.escapeHtml(t.name)}</div>
                                </div>
                                <div class="template-item-actions">
                                    <button class="template-action-btn edit" data-action="edit-tasktype">编辑</button>
                                    <button class="template-action-btn delete" data-action="delete-tasktype">删除</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <div class="empty-state-text">还没有任务类型，点击"新增类型"来添加</div>
                    </div>
                `}
            </div>
        `;
    },

     async renderPointsLogTab() {
        const logs = (await Storage.getPointsLogs()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const totalPoints = await Storage.getTotalPoints();
        const totalEarned = logs.filter(l => l.points > 0).reduce((s, l) => s + l.points, 0);
        const totalSpent = Math.abs(logs.filter(l => l.points < 0).reduce((s, l) => s + l.points, 0));

        const typeLabels = {
            earn: '任务完成',
            bonus: '全勤奖励',
            earn_revert: '取消完成',
            exchange: '兑换奖品'
        };

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value primary">${totalPoints}</div>
                    <div class="stat-label">当前积分</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value success">${totalEarned}</div>
                    <div class="stat-label">累计获得</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value warning">${totalSpent}</div>
                    <div class="stat-label">累计消费</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${logs.length}</div>
                    <div class="stat-label">记录总数</div>
                </div>
            </div>

            <div class="templates-section">
                <div class="templates-header">
                    <div class="templates-title">积分明细</div>
                </div>

                ${logs.length > 0 ? `
                    <div class="points-log-list">
                        ${logs.map(log => `
                            <div class="points-log-item">
                                <div class="points-log-info">
                                    <div class="points-log-desc">${this.escapeHtml(log.description)}</div>
                                    <div class="points-log-meta">
                                        <span class="tag tag-type">${typeLabels[log.type] || log.type}</span>
                                        <span class="points-log-date">${this.formatDateTime(log.createdAt)}</span>
                                    </div>
                                </div>
                                <div class="points-log-amount ${log.points > 0 ? 'positive' : 'negative'}">
                                    ${log.points > 0 ? '+' : ''}${log.points}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">💰</div>
                        <div class="empty-state-text">还没有积分记录</div>
                    </div>
                `}
            </div>
        `;
    },

    formatDateTime(isoStr) {
        const d = new Date(isoStr);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hour}:${minute}`;
    },

     async bindParentModeEvents() {
        document.querySelectorAll('.parent-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentParentTab = tab.dataset.tab;
                this.render();
            });
        });

        document.querySelectorAll('.history-day-header').forEach(header => {
            header.addEventListener('click', () => {
                const tasksEl = header.nextElementSibling;
                tasksEl.classList.toggle('hidden');
            });
        });

        const addTplBtn = document.getElementById('addTemplateBtn');
        if (addTplBtn) {
            addTplBtn.addEventListener('click', () => this.openTemplateModal());
        }

        document.querySelectorAll('.template-item').forEach(item => {
            const tplId = item.dataset.id;
            const editBtn = item.querySelector('[data-action="edit"]');
            const deleteBtn = item.querySelector('[data-action="delete"]');

            editBtn.addEventListener('click', () => this.openTemplateModal(tplId));
            deleteBtn.addEventListener('click', async () => {
                if (confirm('确定要删除这个模板吗？')) {
                    await Storage.deleteTemplate(tplId);
                    this.render();
                    this.showToast('模板已删除', 'success');
                }
            });
        });

        const addRwdBtn = document.getElementById('addRewardBtn');
        if (addRwdBtn) {
            addRwdBtn.addEventListener('click', () => this.openRewardModal());
        }

        document.querySelectorAll('.reward-manage-item').forEach(item => {
            const rwdId = item.dataset.id;
            const editBtn = item.querySelector('[data-action="edit"]');
            const deleteBtn = item.querySelector('[data-action="delete"]');

            editBtn.addEventListener('click', () => this.openRewardModal(rwdId));
            deleteBtn.addEventListener('click', async () => {
                if (confirm('确定要删除这个奖品吗？')) {
                    await Storage.deleteReward(rwdId);
                    this.render();
                    this.showToast('奖品已删除', 'success');
                }
            });
        });

        const addSubBtn = document.getElementById('addSubjectBtn');
        if (addSubBtn) {
            addSubBtn.addEventListener('click', () => this.openSubjectModal());
        }

        document.querySelectorAll('.subject-manage-item').forEach(item => {
            const subId = item.dataset.id;
            const editBtn = item.querySelector('[data-action="edit-subject"]');
            const deleteBtn = item.querySelector('[data-action="delete-subject"]');

            editBtn.addEventListener('click', () => this.openSubjectModal(subId));
            deleteBtn.addEventListener('click', async () => {
                if (confirm('删除科目后，已有任务的科目会显示为"未知"。确定要删除吗？')) {
                    await Storage.deleteSubject(subId);
                    this.render();
                    this.showToast('科目已删除', 'success');
                }
            });
        });

        const addTTBtn = document.getElementById('addTaskTypeBtn');
        if (addTTBtn) {
            addTTBtn.addEventListener('click', () => this.openTaskTypeModal());
        }

        document.querySelectorAll('.tasktype-manage-item').forEach(item => {
            const ttId = item.dataset.id;
            const editBtn = item.querySelector('[data-action="edit-tasktype"]');
            const deleteBtn = item.querySelector('[data-action="delete-tasktype"]');

            editBtn.addEventListener('click', () => this.openTaskTypeModal(ttId));
            deleteBtn.addEventListener('click', async () => {
                if (confirm('删除任务类型后，已有任务的类型会显示为"未知"。确定要删除吗？')) {
                    await Storage.deleteTaskType(ttId);
                    this.render();
                    this.showToast('任务类型已删除', 'success');
                }
            });
        });

        const editCountdownBtn = document.getElementById('editCountdownBtn');
        if (editCountdownBtn) {
            editCountdownBtn.addEventListener('click', () => this.openSettingsModal());
        }
    },

     async openRewardModal(rwdId = null) {
        const rewards = await Storage.getRewards();
        const reward = rwdId ? rewards.find(r => r.id === rwdId) : null;
        const iconOptions = ['🎁', '📺', '🍦', '🎮', '📖', '🎡', '🍔', '🎬', '🎨', '⚽', '🎯', '💰'];

        document.getElementById('modalTitle').textContent = reward ? '编辑奖品' : '新增奖品';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label class="form-label">奖品名称<span class="required">*</span></label>
                <input type="text" class="form-input" id="rwdName" placeholder="例如：看电视 30 分钟" value="${reward ? this.escapeHtml(reward.name) : ''}">
            </div>

            <div class="form-group">
                <label class="form-label">所需积分<span class="required">*</span></label>
                <input type="number" class="form-input" id="rwdCost" placeholder="例如：50" min="1" value="${reward ? reward.cost : ''}">
            </div>

            <div class="form-group">
                <label class="form-label">图标</label>
                <div class="radio-group">
                    ${iconOptions.map(icon => `
                        <div class="radio-item">
                            <input type="radio" name="rwdIcon" id="rwdIcon_${icon}" value="${icon}" ${reward && reward.icon === icon ? 'checked' : ''} ${!reward && icon === '🎁' ? 'checked' : ''}>
                            <label for="rwdIcon_${icon}">${icon}</label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" id="rwdCancelBtn">取消</button>
                <button class="btn btn-primary" id="rwdSaveBtn">保存</button>
            </div>
        `;

        document.getElementById('rwdCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('rwdSaveBtn').addEventListener('click', () => this.saveReward(rwdId));

        this.showModal();
    },

     async saveReward(rwdId) {
        const name = document.getElementById('rwdName').value.trim();
        const cost = parseInt(document.getElementById('rwdCost').value);
        const icon = document.querySelector('input[name="rwdIcon"]:checked')?.value || '🎁';

        if (!name) {
            alert('请输入奖品名称');
            return;
        }
        if (!cost || cost <= 0) {
            alert('请输入有效的积分');
            return;
        }

        if (rwdId) {
            await Storage.updateReward(rwdId, { name, cost, icon });
            this.showToast('奖品已更新', 'success');
        } else {
            await Storage.addReward({
                id: generateId(),
                name,
                cost,
                icon
            });
            this.showToast('奖品已添加', 'success');
        }

        this.closeModal();
        this.render();
    },

     async openSubjectModal(subjectId = null) {
        const subjects = this._subjects;
        const subject = subjectId ? subjects.find(s => s.id === subjectId) : null;
        const presetColors = PRESET_COLORS;

        document.getElementById('modalTitle').textContent = subject ? '编辑科目' : '新增科目';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label class="form-label">科目名称<span class="required">*</span></label>
                <input type="text" class="form-input" id="subjectName" placeholder="例如：物理" value="${subject ? this.escapeHtml(subject.name) : ''}">
            </div>

            <div class="form-group">
                <label class="form-label">选择颜色<span class="required">*</span></label>
                <div class="color-picker">
                    ${presetColors.map((c, idx) => `
                        <div class="color-option ${subject && subject.color === c ? 'selected' : ''}" data-color="${c}" style="background: ${c};" title="${c}"></div>
                    `).join('')}
                </div>
                <input type="hidden" id="subjectColor" value="${subject ? subject.color : presetColors[0]}">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" id="subjectCancelBtn">取消</button>
                <button class="btn btn-primary" id="subjectSaveBtn">保存</button>
            </div>
        `;

        document.querySelectorAll('.color-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                document.getElementById('subjectColor').value = opt.dataset.color;
            });
        });

        document.getElementById('subjectCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('subjectSaveBtn').addEventListener('click', () => this.saveSubject(subjectId));

        this.showModal();
    },

     async saveSubject(subjectId) {
        const name = document.getElementById('subjectName').value.trim();
        const color = document.getElementById('subjectColor').value;

        if (!name) {
            alert('请输入科目名称');
            return;
        }
        if (!color) {
            alert('请选择颜色');
            return;
        }

        if (subjectId) {
            await Storage.updateSubject(subjectId, { name, color });
            this.showToast('科目已更新', 'success');
        } else {
            await Storage.addSubject({ id: generateId(), name, color });
            this.showToast('科目已添加', 'success');
        }

        this.closeModal();
        this.render();
    },

     async openTaskTypeModal(typeId = null) {
        const taskTypes = this._taskTypes;
        const tt = typeId ? taskTypes.find(t => t.id === typeId) : null;

        document.getElementById('modalTitle').textContent = tt ? '编辑任务类型' : '新增任务类型';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label class="form-label">类型名称<span class="required">*</span></label>
                <input type="text" class="form-input" id="taskTypeName" placeholder="例如：做实验" value="${tt ? this.escapeHtml(tt.name) : ''}">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" id="taskTypeCancelBtn">取消</button>
                <button class="btn btn-primary" id="taskTypeSaveBtn">保存</button>
            </div>
        `;

        document.getElementById('taskTypeCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('taskTypeSaveBtn').addEventListener('click', () => this.saveTaskType(typeId));

        this.showModal();
    },

     async saveTaskType(typeId) {
        const name = document.getElementById('taskTypeName').value.trim();

        if (!name) {
            alert('请输入类型名称');
            return;
        }

        if (typeId) {
            await Storage.updateTaskType(typeId, { name });
            this.showToast('任务类型已更新', 'success');
        } else {
            await Storage.addTaskType({ id: generateId(), name });
            this.showToast('任务类型已添加', 'success');
        }

        this.closeModal();
        this.render();
    },

     async openSettingsModal() {
        const settings = await Storage.getSettings();

        document.getElementById('modalTitle').textContent = '设置目标日期';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label class="form-label">考试/目标日期<span class="required">*</span></label>
                <input type="date" class="form-input" id="examDateInput" value="${settings.examDate || '2026-09-01'}">
            </div>

            <div class="form-group">
                <label class="form-label">倒计时标题</label>
                <input type="text" class="form-input" id="countdownLabel" placeholder="例如：距离开学分班考还有" value="${settings.countdownLabel || '距离开学分班考还有'}">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" id="settingsCancelBtn">取消</button>
                <button class="btn btn-primary" id="settingsSaveBtn">保存</button>
            </div>
        `;

        document.getElementById('settingsCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('settingsSaveBtn').addEventListener('click', () => this.saveSettingsFromModal());

        this.showModal();
    },

     async saveSettingsFromModal() {
        const examDate = document.getElementById('examDateInput').value;
        const countdownLabel = document.getElementById('countdownLabel').value.trim();

        if (!examDate) {
            alert('请选择目标日期');
            return;
        }

        await Storage.saveSettings({ 
            examDate, 
            countdownLabel: countdownLabel || '距离开学分班考还有' 
        });
        this.showToast('设置已保存', 'success');
        this.closeModal();
        this.render();
    },

     async openTemplateModal(tplId = null) {
        const templates = await Storage.getTemplates();
        const tpl = tplId ? templates.find(t => t.id === tplId) : null;
        const subjects = this._subjects;
        const taskTypes = this._taskTypes;

        document.getElementById('modalTitle').textContent = tpl ? '编辑模板' : '新增模板';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label class="form-label">模板标题<span class="required">*</span></label>
                <input type="text" class="form-input" id="tplTitle" placeholder="例如：背 20 个英语单词" value="${tpl ? this.escapeHtml(tpl.title) : ''}">
            </div>

            <div class="form-group">
                <label class="form-label">科目<span class="required">*</span></label>
                <div class="radio-group">
                    ${subjects.map((s, idx) => `
                        <div class="radio-item">
                            <input type="radio" name="tplSubject" id="tplSub${idx}" value="${s.id}" ${tpl && tpl.subject === s.id ? 'checked' : ''}>
                            <label for="tplSub${idx}" style="border-color: ${s.color}44; color: ${s.color};">${s.name}</label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">任务类型<span class="required">*</span></label>
                <div class="radio-group">
                    ${taskTypes.map((t, idx) => `
                        <div class="radio-item">
                            <input type="radio" name="tplType" id="tplType${idx}" value="${t.id}" ${tpl && tpl.type === t.id ? 'checked' : ''}>
                            <label for="tplType${idx}">${t.name}</label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">预计用时（分钟）</label>
                <input type="number" class="form-input" id="tplDuration" placeholder="例如：15" min="1" max="300" value="${tpl && tpl.duration ? tpl.duration : ''}">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" id="tplCancelBtn">取消</button>
                <button class="btn btn-primary" id="tplSaveBtn">保存</button>
            </div>
        `;

        document.getElementById('tplCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('tplSaveBtn').addEventListener('click', () => this.saveTemplate(tplId));

        this.showModal();
    },

     async saveTemplate(tplId) {
        const title = document.getElementById('tplTitle').value.trim();
        const subject = document.querySelector('input[name="tplSubject"]:checked')?.value;
        const type = document.querySelector('input[name="tplType"]:checked')?.value;
        const duration = parseInt(document.getElementById('tplDuration').value) || null;

        if (!title) {
            alert('请输入模板标题');
            return;
        }
        if (!subject) {
            alert('请选择科目');
            return;
        }
        if (!type) {
            alert('请选择任务类型');
            return;
        }

        if (tplId) {
            await Storage.updateTemplate(tplId, { title, subject, type, duration });
            this.showToast('模板已更新', 'success');
        } else {
            await Storage.addTemplate({
                id: generateId(),
                title,
                subject,
                type,
                duration
            });
            this.showToast('模板已添加', 'success');
        }

        this.closeModal();
        this.render();
    },

    calculateDaysUntilExam(examDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exam = new Date(examDate);
        exam.setHours(0, 0, 0, 0);
        const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    },

     async calculateStreak() {
        const tasks = await Storage.getTasks();
        const completedDates = new Set();

        tasks.forEach(task => {
            if (task.completed && task.completedAt) {
                const date = formatDate(new Date(task.completedAt));
                completedDates.add(date);
            }
        });

        let streak = 0;
        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        while (true) {
            const dateStr = formatDate(checkDate);
            if (completedDates.has(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    },

     async getWeekData() {
        const result = [];
        const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];
        const tasks = await Storage.getTasks();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const dateStr = formatDate(d);
            const dayTasks = tasks.filter(t => t.date === dateStr);

            result.push({
                label: weekLabels[d.getDay()],
                total: dayTasks.length,
                completed: dayTasks.filter(t => t.completed).length
            });
        }

        return result;
    },

    showModal() {
        document.getElementById('modalOverlay').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
    },

    showToast(message, type = 'default') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2500);
    },

    celebrate() {
        const colors = ['#f5222d', '#fa8c16', '#fadb14', '#52c41a', '#1677ff', '#722ed1'];
        const celebration = document.createElement('div');
        celebration.className = 'celebration';

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.width = (6 + Math.random() * 8) + 'px';
            confetti.style.height = (6 + Math.random() * 8) + 'px';
            celebration.appendChild(confetti);
        }

        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 5000);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
