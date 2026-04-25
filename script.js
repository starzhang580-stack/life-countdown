// ===== 数据存储 =====
const userData = {
    age: null,
    gender: null,
    country: null,
    sleep: 0,
    exercise: 0,
    satisfaction: 0
};

// ===== 各国平均寿命（WHO数据）=====
const lifeExpectancy = {
    spain: { male: 80, female: 86 },
    china: { male: 76, female: 79 },
    us: { male: 76, female: 81 },
    uk: { male: 79, female: 83 },
    japan: { male: 81, female: 87 },
    germany: { male: 79, female: 83 }
};

// ===== 页面导航 =====
function goToStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    window.scrollTo(0, 0);
}

function goToStep1() {
    goToStep(1);
}

function goToStep2() {
    const age = document.getElementById('age').value;
    const gender = document.querySelector('input[name="gender"]:checked');

    if (!age || !gender) {
        alert('请填完所有信息');
        return;
    }

    userData.age = parseInt(age);
    userData.gender = gender.value;
    userData.country = document.getElementById('country').value;

    goToStep(2);
}

function goToResults() {
    if (userData.sleep === 0 && userData.exercise === 0 && userData.satisfaction === 0) {
        alert('请完成所有问题');
        return;
    }

    calculateResults();
    goToStep(3);
}

// ===== 选项回答 =====
function setAnswer(question, value) {
    userData[question] = value;
    
    // 更新按钮状态
    const questionDiv = event.target.closest('.question');
    questionDiv.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.closest('.option-btn').classList.add('selected');
}

// ===== 核心计算函数 =====
function calculateResults() {
    // 1. 获取基础寿命
    const baseLife = lifeExpectancy[userData.country][userData.gender];

    // 2. 应用生活方式加成（权重模型）
    const lifeModifier = 
        userData.exercise * 1.5 +      // 运动：最多+4.5年
        userData.sleep * 0.8 +         // 睡眠：最多+2.4年
        userData.satisfaction * 1.2;   // 满意度：最多+3.6年

    // 3. 计算预期寿命
    const predictedLife = baseLife + lifeModifier;

    // 4. 计算剩余时间
    const yearsRemaining = Math.max(0, predictedLife - userData.age);
    const daysRemaining = Math.round(yearsRemaining * 365.25);
    const weekendsRemaining = Math.round(yearsRemaining * 52);
    const summersRemaining = Math.round(yearsRemaining);

    // 5. 计算进度
    const usedPercentage = Math.round((userData.age / predictedLife) * 100);

    // 6. 生成改善建议
    const suggestions = generateSuggestions();

    // 7. 更新UI
    updateResultsUI(daysRemaining, weekendsRemaining, yearsRemaining, summersRemaining, usedPercentage, suggestions);

    // 存储计算结果以供分享
    window.lastResult = {
        days: daysRemaining,
        weekends: weekendsRemaining,
        years: yearsRemaining,
        age: userData.age,
        country: userData.country
    };
}

// ===== 生成改善建议 =====
function generateSuggestions() {
    const suggestions = [];
    let totalGain = 0;

    if (userData.exercise < 3) {
        suggestions.push({ name: '增加运动频率', gain: 3, unit: '年' });
        totalGain += 3;
    }
    if (userData.sleep > 0) {
        suggestions.push({ name: '调整作息规律', gain: 2, unit: '年' });
        totalGain += 2;
    }
    if (userData.satisfaction < 1) {
        suggestions.push({ name: '改善心理健康', gain: 1.5, unit: '年' });
        totalGain += 1.5;
    }

    if (suggestions.length === 0) {
        suggestions.push({ name: '保持现在的生活方式', gain: '很好', unit: '' });
    }

    return { items: suggestions, total: totalGain };
}

// ===== 更新结果UI =====
function updateResultsUI(days, weekends, years, summers, progress, suggestions) {
    // 更新主要数字
    document.getElementById('daysRemaining').textContent = days.toLocaleString();
    document.getElementById('weekendsRemaining').textContent = weekends.toLocaleString();
    document.getElementById('yearsRemaining').textContent = Math.round(years);
    document.getElementById('summersRemaining').textContent = Math.round(summers);

    // 更新进度条
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `你已经使用了 ${progress}%`;

    // 生成建议列表
    const suggestionList = document.getElementById('suggestionList');
    suggestionList.innerHTML = suggestions.items.map(s => `
        <div class="suggestion-item">
            <span class="name">${s.name}</span>
            <span class="gain">${s.gain ? '+' + s.gain : ''}${s.unit}</span>
        </div>
    `).join('');

    // 更新总收益
    const totalGain = suggestions.total;
    document.getElementById('potentialGain').textContent = 
        totalGain > 0 
            ? `你最多可以多获得 ${totalGain.toFixed(1)} 年人生` 
            : '你的生活方式已经很健康了！';
}

// ===== 分享功能 =====
function shareResult() {
    const weekends = document.getElementById('weekendsRemaining').textContent;
    const shareText = `我还有 ${weekends} 个周末！\n\n你还有多少个？检查你的人生时间余额 ⏰`;

    if (navigator.share) {
        navigator.share({
            title: '你还有多少个周末？',
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('分享被取消'));
    } else {
        // 降级方案：复制到剪贴板
        navigator.clipboard.writeText(shareText).then(() => {
            alert('已复制到剪贴板！快分享给朋友吧 🎉');
        });
    }
}

// ===== 下载报告 =====
function downloadResult() {
    const age = userData.age;
    const country = userData.country;
    const days = document.getElementById('daysRemaining').textContent;
    const weekends = document.getElementById('weekendsRemaining').textContent;
    const years = document.getElementById('yearsRemaining').textContent;
    const progress = document.getElementById('progressText').textContent;

    const report = `
人生时间余额报告
=====================================
年龄：${age}岁
国家/地区：${country}

📊 剩余时间：
   • ${days} 天
   • ${weekends} 个周末
   • ${years} 年

${progress}

生成时间：${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '人生时间余额报告.txt';
    link.click();
}

// ===== 重新开始 =====
function restart() {
    userData.age = null;
    userData.gender = null;
    userData.country = null;
    userData.sleep = 0;
    userData.exercise = 0;
    userData.satisfaction = 0;

    document.getElementById('age').value = '';
    document.querySelectorAll('input[name="gender"]').forEach(r => r.checked = false);
    document.getElementById('country').value = 'spain';
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    goToStep(1);
}

// ===== 页面加载完成后初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 页面已加载，应用就绪！');
});
