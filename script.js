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

const celebrationImages = [
  "images/celebration1.png",
  "images/celebration2.png",
  "images/celebration3.png",
];

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

function showCompletionModal(taskTitle, xpGained) {
  modalTitle.textContent = `${taskTitle} 完了！`;
  modalMessage.textContent = `${xpGained} XP を獲得しました！`;
  modalImage.src = getRandomCelebrationImage();
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
  showCompletionModal(task.title, task.xp);

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
    const li = document.createElement("li");
    li.className = "task-card";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${task.xp} XP`;

    const button = document.createElement("button");
    button.textContent = "完了する";
    button.addEventListener("click", (event) => {
      completeTask(task.id, event.target);
    });

    li.appendChild(title);
    li.appendChild(meta);
    li.appendChild(button);
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

renderTaskCatalog();
renderHistory();
updateStatus();
