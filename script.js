const questForm = document.getElementById("questForm");
const questTitle = document.getElementById("questTitle");
const questXp = document.getElementById("questXp");
const questItems = document.getElementById("questItems");
const levelValue = document.getElementById("levelValue");
const xpValue = document.getElementById("xpValue");
const nextLevelXp = document.getElementById("nextLevelXp");
const xpFill = document.getElementById("xpFill");
const clearAll = document.getElementById("clearAll");

const STORAGE_KEY = "householdRpgState";

const defaultState = {
  xp: 0,
  level: 1,
  quests: [],
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("ロードエラー", error);
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getXpForNextLevel(level) {
  return 100 + (level - 1) * 40;
}

function updateStatus() {
  const nextXp = getXpForNextLevel(state.level);
  levelValue.textContent = state.level;
  xpValue.textContent = state.xp;
  nextLevelXp.textContent = nextXp;
  const fill = Math.min((state.xp / nextXp) * 100, 100);
  xpFill.style.width = `${fill}%`;
}

function addQuest(title, xp) {
  state.quests.push({ id: Date.now(), title, xp, done: false });
  saveState();
  renderQuests();
}

function completeQuest(id) {
  const quest = state.quests.find((item) => item.id === id);
  if (!quest || quest.done) return;
  quest.done = true;
  state.xp += quest.xp;
  while (state.xp >= getXpForNextLevel(state.level)) {
    state.xp -= getXpForNextLevel(state.level);
    state.level += 1;
  }
  saveState();
  renderQuests();
  updateStatus();
}

function clearQuestList() {
  state.quests = [];
  saveState();
  renderQuests();
}

function renderQuests() {
  questItems.innerHTML = "";
  if (state.quests.length === 0) {
    questItems.innerHTML = "<li class='empty'>クエストがありません。新しいクエストを追加してください。</li>";
    return;
  }

  state.quests.forEach((quest) => {
    const li = document.createElement("li");
    li.className = `quest-card${quest.done ? " completed" : ""}`;

    const info = document.createElement("div");
    info.className = "info";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = quest.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `XP ${quest.xp} / ${quest.done ? "完了" : "未完了"}`;

    info.appendChild(title);
    info.appendChild(meta);

    const button = document.createElement("button");
    button.textContent = quest.done ? "完了" : "完了にする";
    button.disabled = quest.done;
    button.addEventListener("click", () => completeQuest(quest.id));

    li.appendChild(info);
    li.appendChild(button);
    questItems.appendChild(li);
  });
}

questForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = questTitle.value.trim();
  const xp = Number(questXp.value);
  if (!title || xp <= 0) return;
  addQuest(title, xp);
  questForm.reset();
  questXp.value = "20";
  questTitle.focus();
});

clearAll.addEventListener("click", () => {
  if (confirm("本当にすべてのクエストを削除しますか？")) {
    clearQuestList();
  }
});

updateStatus();
renderQuests();
