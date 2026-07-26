let dataStore = null;

function initDefaultData() {
    const defaultTemplates = [
        { id: 'tpl-1', title: '背 20 个英语单词', subject: 'english', type: 'vocabulary', duration: 15 },
        { id: 'tpl-2', title: '做一篇语文阅读理解', subject: 'chinese', type: 'exercise', duration: 20 },
        { id: 'tpl-3', title: '做数学练习题 10 道', subject: 'math', type: 'exercise', duration: 25 },
        { id: 'tpl-4', title: '背诵英语课文一篇', subject: 'english', type: 'recitation', duration: 20 },
        { id: 'tpl-5', title: '背诵古诗词一首', subject: 'chinese', type: 'recitation', duration: 10 }
    ];

    const defaultRewards = [
        { id: 'rw-1', name: '看电视 30 分钟', cost: 50, icon: '📺' },
        { id: 'rw-2', name: '买冰淇淋一个', cost: 30, icon: '🍦' },
        { id: 'rw-3', name: '玩游戏 1 小时', cost: 80, icon: '🎮' },
        { id: 'rw-4', name: '买一本书', cost: 200, icon: '📖' },
        { id: 'rw-5', name: '周末出去玩', cost: 300, icon: '🎡' }
    ];

    return {
        tasks: [],
        templates: defaultTemplates,
        rewards: defaultRewards,
        pointsLogs: [],
        settings: { examDate: '2026-09-01', mode: 'kid' }
    };
}

async function getData() {
    if (!dataStore) {
        dataStore = initDefaultData();
    }
    return dataStore;
}

async function saveData(data) {
    dataStore = data;
}

module.exports = { getData, saveData, initDefaultData };
