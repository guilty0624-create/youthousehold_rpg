const taskItems = document.getElementById("taskItems");
const historyItems = document.getElementById("historyItems");
const levelValue = document.getElementById("levelValue");
const xpValue = document.getElementById("xpValue");
const nextLevelXp = document.getElementById("nextLevelXp");
const xpFill = document.getElementById("xpFill");
const clearAll = document.getElementById("clearAll");
const resetAll = document.getElementById("resetAll");
const rewardText = document.getElementById("nextReward");
const rewardNotice = document.getElementById("rewardNotice");
const celebrationContainer = document.getElementById("celebrationContainer");
const completionModal = document.getElementById("completionModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalImage = document.getElementById("modalImage");

// 天気要素
const weatherIcon = document.getElementById("weatherIcon");
const currentTemp = document.getElementById("currentTemp");
const weatherDesc = document.getElementById("weatherDesc");
const hourlyList = document.getElementById("hourlyList");
const weeklyList = document.getElementById("weeklyList");

const celebrationImages = [
  "images/celebration1.png",
  "images/celebration2.png",
  "images/celebration3.png",
];

// 天気アイコンマッピング
const weatherCodes = {
  0: { icon: "☀️", desc: "快晴" },
  1: { icon: "🌤️", desc: "晴れ" },
  2: { icon: "⛅", desc: "晴れ時々曇り" },
  3: { icon: "☁️", desc: "曇り" },
  45: { icon: "🌫️", desc: "霧" },
  48: { icon: "🌫️", desc: "霧" },
  51: { icon: "🌧️", desc: "小雨" },
  53: { icon: "🌧️", desc: "雨" },
  55: { icon: "🌧️", desc: "雨" },
  61: { icon: "🌧️", desc: "雨" },
  63: { icon: "🌧️", desc: "雨" },
  65: { icon: "🌧️", desc: "大雨" },
  71: { icon: "❄️", desc: "雪" },
  73: { icon: "❄️", desc: "雪" },
  75: { icon: "❄️", desc: "大雪" },
  80: { icon: "🌦️", desc: "にわか雨" },
  81: { icon: "🌦️", desc: "にわか雨" },
  82: { icon: "🌦️", desc: "にわか雨" },
  95: { icon: "⚡", desc: "雷雨" },
  96: { icon: "⚡", desc: "雷雨" },
  99: { icon: "⚡", desc: "雷雨" },
};

const STORAGE_KEY = "householdRpgState";

const taskCatalog = [
  { id: "trash", title: "ゴミ出し", xp: 20 },
  { id: "dishes", title: "皿洗い", xp: 15 },
  { id: "vacuum", title: "掃除機かけ", xp: 30 },
  { id: "cooking", title: "料理", xp: 35 },
  { id: "laundry", title: "洗濯", xp: 25 },
];

const rewardCatalog = {
  2: "好きなデザート",
  3: "リラックスタイム30分",
  4: "映画鑑賞",
  5: "スペシャルボーナス",
};

const defaultState = {
  xp: 0,
  level: 1,
  history: [],
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    return JSON.parse(raw);
  } catch (error) {
    console.warn("ロードエラー", error);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getXpForNextLevel(level) {
  return 100 + (level - 1) * 40;
}

function getNextLevelReward(level) {
  return rewardCatalog[level + 1] || "次のレベルで報酬がもらえます";
}

function showRewardNotice(message) {
  rewardNotice.textContent = message;
  rewardNotice.classList.add("visible");
  setTimeout(() => {
    rewardNotice.classList.remove("visible");
  }, 5000);
}

function updateStatus() {
  const nextXp = getXpForNextLevel(state.level);
  levelValue.textContent = state.level;
  xpValue.textContent = state.xp;
  nextLevelXp.textContent = nextXp;
  const fill = Math.min((state.xp / nextXp) * 100, 100);
  xpFill.style.width = `${fill}%`;
  rewardText.querySelector("span").textContent = getNextLevelReward(state.level);
}

function earnXp(amount) {
  state.xp += amount;
  const rewards = [];
  while (state.xp >= getXpForNextLevel(state.level)) {
    state.xp -= getXpForNextLevel(state.level);
    state.level += 1;
    rewards.push(rewardCatalog[state.level] || `レベル${state.level}到達`);
  }

  if (rewards.length > 0) {
    showRewardNotice(`レベルアップ！ ${state.level}になりました。報酬: ${rewards.join("、 ")}`);
  }
}

function addHistoryEntry(task) {
  state.history.unshift({
    id: Date.now(),
    title: task.title,
    xp: task.xp,
    date: new Date().toLocaleString(),
  });
}

function triggerCelebration(x, y) {
  const emojis = ["⭐", "✨", "🎉", "🎊", "💫", "🌟"];
  const celebrationCount = 12;

  for (let i = 0; i < celebrationCount; i++) {
    const pop = document.createElement("div");
    pop.className = `pop ${Math.random() > 0.5 ? "star" : "emoji"}`;
    pop.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    pop.style.left = x + "px";
    pop.style.top = y + "px";

    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;
    pop.style.setProperty("--offsetX", offsetX + "px");
    pop.style.setProperty("--offsetY", offsetY + "px");

    celebrationContainer.appendChild(pop);

    setTimeout(() => pop.remove(), 1000);
  }
}

function getRandomCelebrationImage() {
  return celebrationImages[Math.floor(Math.random() * celebrationImages.length)];
}

function showCompletionModal(task, xp, decorPoints) {
  modalTitle.textContent = `${task.title} 完了！`;
  const message = document.getElementById('modalMessage');
  if (message) {
    message.innerHTML = `
      <div style="line-height: 1.6;">
        <p>🌟 経験値: +${xp} XP</p>
        <p>🎨 デコポイント: +${decorPoints}</p>
      </div>
    `;
  }
  completionModal.classList.add("active");
}

function closeCompletionModal() {
  completionModal.classList.remove("active");
}

modalCloseBtn.addEventListener("click", closeCompletionModal);
completionModal.addEventListener("click", (event) => {
  if (event.target === completionModal) {
    closeCompletionModal();
  }
});

function completeTask(taskId, buttonElement) {
  const task = taskCatalog.find((item) => item.id === taskId);
  if (!task) return;
  addHistoryEntry(task);
  earnXp(task.xp);
  saveState();
  renderHistory();
  updateStatus();

  // ポップアップウィンドウを表示
  showCompletionModal(task, task.xp, calculateDecorPoints(task.xp));

  // ボタン位置でパーティクルアニメーション
  if (buttonElement) {
    const rect = buttonElement.getBoundingClientRect();
    triggerCelebration(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
}

function clearHistory() {
  state.history = [];
  saveState();
  renderHistory();
}

function resetAllProgress() {
  if (!confirm("この操作は元に戻せません。レベル、XP、実施履歴がすべて消えます。本当に実行しますか？")) {
    return;
  }
  state = JSON.parse(JSON.stringify(defaultState));
  saveState();
  renderHistory();
  updateStatus();
  showRewardNotice("全データをリセットしました。最初からやり直せます。");
}

function renderTaskCatalog() {
  taskItems.innerHTML = "";
  taskCatalog.forEach((task) => {
    const decorPoints = calculateDecorPoints(task.xp);

    const li = document.createElement("li");
    li.className = "task-card";
    li.innerHTML = `
      <div>
        <div class="title">${task.title}</div>
        <div class="meta">
          <span>⭐ ${task.xp} XP</span>
          <span class="decor-meta">🎨 +${decorPoints} デコポイント</span>
        </div>
      </div>
      <button class="task-btn" type="button">完了する</button>
    `;

    li.querySelector('button').addEventListener('click', () => completeTask(task.id));
    taskItems.appendChild(li);
  });
}

function renderHistory() {
  historyItems.innerHTML = "";
  if (state.history.length === 0) {
    historyItems.innerHTML = "<li class='empty'>まだ実施した家事がありません。上の家事を選択してみましょう。</li>";
    return;
  }

  state.history.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "quest-card completed";

    const info = document.createElement("div");
    info.className = "info";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = entry.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${entry.xp} XP — ${entry.date}`;

    info.appendChild(title);
    info.appendChild(meta);
    li.appendChild(info);
    historyItems.appendChild(li);
  });
}

clearAll.addEventListener("click", () => {
  if (confirm("本当に実施済み家事の履歴を消しますか？")) {
    clearHistory();
  }
});

resetAll.addEventListener("click", resetAllProgress);

// 天気取得関数（Open-Meteo API使用、神戸市的度: 135.2, 34.69）
async function fetchWeather() {
  const lat = 34.69;
  const lon = 135.2;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // 現在の天気と気温
    const currentHour = new Date().getHours();
    const currentTemp = Math.round(data.hourly.temperature_2m[currentHour]);
    const currentCode = data.hourly.weather_code[currentHour];
    const weatherInfo = weatherCodes[currentCode] || { icon: "☁️", desc: "不明" };
    
    weatherIcon.textContent = weatherInfo.icon;
    currentTemp.textContent = `${currentTemp}°C`;
    weatherDesc.textContent = weatherInfo.desc;
    
    // 今日の時間別気温（3時間ごと）
    hourlyList.innerHTML = "";
    for (let i = 0; i < 24; i += 3) {
      const hour = i;
      const temp = Math.round(data.hourly.temperature_2m[hour]);
      const code = data.hourly.weather_code[hour];
      const info = weatherCodes[code] || { icon: "☁️", desc: "" };
      
      const item = document.createElement("div");
      item.className = "hourly-item";
      item.innerHTML = `
        <div class="time">${String(hour).padStart(2, "0")}:00</div>
        <div class="icon">${info.icon}</div>
        <div class="temp">${temp}°</div>
      `;
      hourlyList.appendChild(item);
    }
    
    // 週間予報
    weeklyList.innerHTML = "";
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = days[date.getDay()];
      const month = date.getMonth() + 1;
      const dayNum = date.getDate();
      const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
      const minTemp = Math.round(data.daily.temperature_2m_min[i]);
      const code = data.daily.weather_code[i];
      const info = weatherCodes[code] || { icon: "☁️", desc: "" };
      
      const item = document.createElement("div");
      item.className = "weekly-item";
      item.innerHTML = `
        <div class="day">${month}/${dayNum} (${dayName})</div>
        <div class="icon">${info.icon}</div>
        <div class="temp">${maxTemp}° / ${minTemp}°</div>
      `;
      weeklyList.appendChild(item);
    }
    
  } catch (error) {
    console.error("天気取得エラー:", error);
    weatherDesc.textContent = "天気を取得できませんでした";
  }
}

// 天気更新（ページ読み込み時）
fetchWeather();

renderTaskCatalog();
renderHistory();
updateStatus();

function calculateDecorPoints(xp) {
  return Math.ceil(xp / 5);
}
