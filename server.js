const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function getLocalIPs() {
    const nets = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                ips.push(net.address);
            }
        }
    }
    return ips;
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 学习打卡服务已启动`);
    console.log(`   本机访问: http://localhost:${PORT}`);
    const ips = getLocalIPs();
    if (ips.length > 0) {
        console.log(`   局域网访问:`);
        ips.forEach(ip => console.log(`     http://${ip}:${PORT}`));
    }
    console.log(``);
    console.log(`   数据存储在浏览器 localStorage 中，无需后端数据库`);
});
