const STORAGE_KEYS = {
    TASKS: 'study_checkin_tasks',
    TEMPLATES: 'study_checkin_templates',
    SETTINGS: 'study_checkin_settings',
    POINTS_LOGS: 'study_checkin_points_logs',
    REWARDS: 'study_checkin_rewards'
};

const FULL_ATTENDANCE_BONUS = 30;

const SUBJECTS = {
    chinese: { name: '语文', tagClass: 'tag-chinese' },
    math: { name: '数学', tagClass: 'tag-math' },
    english: { name: '英语', tagClass: 'tag-english' }
};

const TASK_TYPES = {
    exercise: '练习题',
    vocabulary: '背单词',
    recitation: '背课文'
};

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
    }
};

const App = {
    currentMode: 'kid',
    currentParentTab: 'overview',
    currentKidTab: 'tasks',

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
        const main = document.getElementById('mainContent');
        if (this.currentMode === 'kid') {
            main.innerHTML = await this.renderKidMode();
            this.bindKidModeEvents();
        } else {
            main.innerHTML = await this.renderParentMode();
            this.bindParentModeEvents();
        }
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
                <div class="countdown-label">距离开学分班考还有</div>
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

            <div class="kid-tab-content ${this.currentKidTab === 'shop' ? '' : 'hidden'}" id="kidTabShop">
                ${shopHtml}
            </div>
        `;
    },

    renderTaskItem(task) {
        const subject = SUBJECTS[task.subject];
        const typeName = TASK_TYPES[task.type];
        const points = task.duration || 0;

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle"></div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-tags">
                        <span class="tag ${subject.tagClass}">${subject.name}</span>
                        <span class="tag tag-type">${typeName}</span>
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
                    <div class="radio-item subject-chinese">
                        <input type="radio" name="subject" id="subChinese" value="chinese">
                        <label for="subChinese">语文</label>
                    </div>
                    <div class="radio-item subject-math">
                        <input type="radio" name="subject" id="subMath" value="math">
                        <label for="subMath">数学</label>
                    </div>
                    <div class="radio-item subject-english">
                        <input type="radio" name="subject" id="subEnglish" value="english">
                        <label for="subEnglish">英语</label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">任务类型<span class="required">*</span></label>
                <div class="radio-group">
                    <div class="radio-item">
                        <input type="radio" name="taskType" id="typeExercise" value="exercise">
                        <label for="typeExercise">练习题</label>
                    </div>
                    <div class="radio-item">
                        <input type="radio" name="taskType" id="typeVocab" value="vocabulary">
                        <label for="typeVocab">背单词</label>
                    </div>
                    <div class="radio-item">
                        <input type="radio" name="taskType" id="typeRecite" value="recitation">
                        <label for="typeRecite">背课文</label>
                    </div>
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
        const [overviewHtml, historyHtml, templatesHtml, rewardsHtml, pointsHtml] = await Promise.all([
            this.renderOverviewTab(),
            this.renderHistoryTab(),
            this.renderTemplatesTab(),
            this.renderRewardsTab(),
            this.renderPointsLogTab()
        ]);
        return `
            <div class="parent-tabs">
                <button class="parent-tab ${this.currentParentTab === 'overview' ? 'active' : ''}" data-tab="overview">统计概览</button>
                <button class="parent-tab ${this.currentParentTab === 'history' ? 'active' : ''}" data-tab="history">历史记录</button>
                <button class="parent-tab ${this.currentParentTab === 'templates' ? 'active' : ''}" data-tab="templates">任务模板</button>
                <button class="parent-tab ${this.currentParentTab === 'rewards' ? 'active' : ''}" data-tab="rewards">奖品管理</button>
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

        const subjectStats = {
            chinese: tasks.filter(t => t.subject === 'chinese').length,
            math: tasks.filter(t => t.subject === 'math').length,
            english: tasks.filter(t => t.subject === 'english').length
        };
        const maxSubjectCount = Math.max(1, ...Object.values(subjectStats));

        const weekData = await this.getWeekData();

        return `
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
                ${Object.entries(SUBJECTS).map(([key, val]) => `
                    <div class="subject-bar">
                        <div class="subject-bar-header">
                            <span class="subject-bar-name">${val.name}</span>
                            <span class="subject-bar-count">${subjectStats[key]} 个任务</span>
                        </div>
                        <div class="subject-bar-track">
                            <div class="subject-bar-fill ${key}" style="width: ${(subjectStats[key] / maxSubjectCount) * 100}%"></div>
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
                            const subject = SUBJECTS[tpl.subject];
                            const typeName = TASK_TYPES[tpl.type];
                            return `
                                <div class="template-item" data-id="${tpl.id}">
                                    <div class="template-item-info">
                                        <div class="template-item-title">${this.escapeHtml(tpl.title)}</div>
                                        <div class="template-item-meta">
                                            <span class="tag ${subject.tagClass}">${subject.name}</span>
                                            <span class="tag tag-type">${typeName}</span>
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

     async openTemplateModal(tplId = null) {
        const templates = await Storage.getTemplates();
        const tpl = tplId ? templates.find(t => t.id === tplId) : null;

        document.getElementById('modalTitle').textContent = tpl ? '编辑模板' : '新增模板';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label class="form-label">模板标题<span class="required">*</span></label>
                <input type="text" class="form-input" id="tplTitle" placeholder="例如：背 20 个英语单词" value="${tpl ? this.escapeHtml(tpl.title) : ''}">
            </div>

            <div class="form-group">
                <label class="form-label">科目<span class="required">*</span></label>
                <div class="radio-group">
                    <div class="radio-item subject-chinese">
                        <input type="radio" name="tplSubject" id="tplChinese" value="chinese" ${tpl && tpl.subject === 'chinese' ? 'checked' : ''}>
                        <label for="tplChinese">语文</label>
                    </div>
                    <div class="radio-item subject-math">
                        <input type="radio" name="tplSubject" id="tplMath" value="math" ${tpl && tpl.subject === 'math' ? 'checked' : ''}>
                        <label for="tplMath">数学</label>
                    </div>
                    <div class="radio-item subject-english">
                        <input type="radio" name="tplSubject" id="tplEnglish" value="english" ${tpl && tpl.subject === 'english' ? 'checked' : ''}>
                        <label for="tplEnglish">英语</label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">任务类型<span class="required">*</span></label>
                <div class="radio-group">
                    <div class="radio-item">
                        <input type="radio" name="tplType" id="tplExercise" value="exercise" ${tpl && tpl.type === 'exercise' ? 'checked' : ''}>
                        <label for="tplExercise">练习题</label>
                    </div>
                    <div class="radio-item">
                        <input type="radio" name="tplType" id="tplVocab" value="vocabulary" ${tpl && tpl.type === 'vocabulary' ? 'checked' : ''}>
                        <label for="tplVocab">背单词</label>
                    </div>
                    <div class="radio-item">
                        <input type="radio" name="tplType" id="tplRecite" value="recitation" ${tpl && tpl.type === 'recitation' ? 'checked' : ''}>
                        <label for="tplRecite">背课文</label>
                    </div>
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
