const DECORATOR_ITEMS = {
  furniture: [
    { id: 'sofa', emoji: '🛋️', name: 'ソファ', cost: 50 },
    { id: 'table', emoji: '🪑', name: 'テーブル', cost: 30 },
    { id: 'bed', emoji: '🛏️', name: 'ベッド', cost: 80 },
    { id: 'shelf', emoji: '🗄️', name: '本棚', cost: 40 },
    { id: 'lamp', emoji: '💡', name: 'ランプ', cost: 25 },
    { id: 'carpet', emoji: '🧶', name: 'カーペット', cost: 35 },
  ],
  plants: [
    { id: 'cactus', emoji: '🌵', name: 'サボテン', cost: 20 },
    { id: 'flower', emoji: '🌹', name: 'バラ', cost: 25 },
    { id: 'potted', emoji: '🪴', name: '観葉植物', cost: 30 },
    { id: 'sunflower', emoji: '🌻', name: 'ひまわり', cost: 15 },
    { id: 'herb', emoji: '🌿', name: 'ハーブ', cost: 12 },
    { id: 'tree', emoji: '🌲', name: 'クリスマスツリー', cost: 60 },
  ],
  lights: [
    { id: 'bulb', emoji: '💡', name: '電球', cost: 15 },
    { id: 'neon', emoji: '✨', name: 'ネオンライト', cost: 40 },
    { id: 'candle', emoji: '🕯️', name: 'ろうそく', cost: 10 },
    { id: 'star', emoji: '⭐', name: '星', cost: 20 },
    { id: 'moon', emoji: '🌙', name: '月', cost: 25 },
    { id: 'fire', emoji: '🔥', name: 'たき火', cost: 30 },
  ],
  wall: [
    { id: 'wall1', emoji: '🧱', name: 'レンガ', cost: 0, isWall: true },
    { id: 'wall2', emoji: '⬜', name: '白い壁', cost: 0, isWall: true },
    { id: 'wall3', emoji: '🎨', name: 'カラフル', cost: 50, isWall: true },
    { id: 'wall4', emoji: '🌳', name: '自然', cost: 60, isWall: true },
  ],
};

class DecoratorGame {
  constructor() {
    this.decorPoints = this.loadDecorPoints();
    this.decoratedItems = this.loadDecoratedItems();
    this.selectedItem = null;
    this.currentCategory = 'furniture';
    this.canvas = document.getElementById('roomCanvas');
    this.itemsContainer = document.getElementById('decorItems');
    this.pointsDisplay = document.getElementById('decorPoints');

    this.init();
  }

  init() {
    this.updatePointsDisplay();
    this.renderItemList();
    this.renderDecoratedItems();
    this.attachEventListeners();
    this.syncWithQuestPage();
  }

  syncWithQuestPage() {
    // クエストページから経験値を取得してデコポイントに変換
    const playerData = JSON.parse(localStorage.getItem('playerData')) || {};
    const xp = playerData.xp || 0;
    const questCompletion = playerData.questCompletion || {};
    const completedQuests = Object.values(questCompletion).filter(q => q.completed).length;
    
    // 完了済みクエスト1つ = 10デコポイント
    const earnedPoints = completedQuests * 10;
    this.decorPoints = Math.max(this.decorPoints, earnedPoints);
    this.saveDecorPoints();
    this.updatePointsDisplay();
  }

  loadDecorPoints() {
    return parseInt(localStorage.getItem('decorPoints')) || 0;
  }

  saveDecorPoints() {
    localStorage.setItem('decorPoints', this.decorPoints);
  }

  loadDecoratedItems() {
    return JSON.parse(localStorage.getItem('decoratedItems')) || [];
  }

  saveDecoratedItems() {
    localStorage.setItem('decoratedItems', JSON.stringify(this.decoratedItems));
  }

  updatePointsDisplay() {
    this.pointsDisplay.textContent = this.decorPoints;
  }

  renderItemList() {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';

    const items = DECORATOR_ITEMS[this.currentCategory];
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'item-btn';
      if (!item.isWall && item.cost > this.decorPoints) {
        btn.classList.add('disabled');
      }
      btn.innerHTML = `${item.emoji}`;
      if (!item.isWall) {
        const cost = document.createElement('span');
        cost.className = 'cost';
        cost.textContent = item.cost;
        btn.appendChild(cost);
      }
      btn.addEventListener('click', () => this.selectItemToPlace(item, btn));
      itemList.appendChild(btn);
    });
  }

  selectItemToPlace(itemData, btnElement) {
    if (!itemData.isWall && itemData.cost > this.decorPoints) return;

    // キャンバスをクリック待機状態に
    this.selectedItem = itemData;
    
    // UI更新
    document.querySelectorAll('.item-btn').forEach(btn => {
      btn.style.opacity = '0.6';
    });
    btnElement.style.opacity = '1';

    this.canvas.style.cursor = 'crosshair';
    this.updateItemDetails(itemData);
  }

  attachEventListeners() {
    // キャンバスクリックでアイテム配置
    this.canvas.addEventListener('click', (e) => {
      if (!this.selectedItem) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.placeItem(this.selectedItem, x, y);
      this.selectedItem = null;
      this.canvas.style.cursor = 'default';
      document.querySelectorAll('.item-btn').forEach(btn => {
        btn.style.opacity = '1';
      });
    });

    // カテゴリータブ
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.renderItemList();
      });
    });

    // アクションボタン
    document.getElementById('rotateBtn').addEventListener('click', () => this.rotateSelected());
    document.getElementById('deleteBtn').addEventListener('click', () => this.deleteSelected());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetAll());
  }

  placeItem(itemData, x, y) {
    if (!itemData.isWall && itemData.cost > this.decorPoints) return;

    // コスト支払い
    if (!itemData.isWall) {
      this.decorPoints -= itemData.cost;
      this.saveDecorPoints();
      this.updatePointsDisplay();
      this.renderItemList();
    }

    const decorItem = {
      id: Date.now(),
      ...itemData,
      x,
      y,
      rotation: 0,
    };

    this.decoratedItems.push(decorItem);
    this.saveDecoratedItems();
    this.renderDecoratedItems();
  }

  renderDecoratedItems() {
    this.itemsContainer.innerHTML = '';

    this.decoratedItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'decor-item';
      div.style.left = item.x + 'px';
      div.style.top = item.y + 'px';
      div.style.transform = `rotate(${item.rotation}deg)`;
      div.dataset.id = item.id;

      const content = document.createElement('div');
      content.className = 'decor-item-content';
      content.textContent = item.emoji;

      div.appendChild(content);

      div.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectDecoItem(item, div);
      });

      // ドラッグ機能
      this.makeDraggable(div, item);

      this.itemsContainer.appendChild(div);
    });
  }

  makeDraggable(element, item) {
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
      this.selectDecoItem(item, element);
      offsetX = e.clientX - element.offsetLeft;
      offsetY = e.clientY - element.offsetTop;
      element.style.cursor = 'grabbing';

      const onMouseMove = (e) => {
        element.style.left = (e.clientX - this.canvas.getBoundingClientRect().left - offsetX) + 'px';
        element.style.top = (e.clientY - this.canvas.getBoundingClientRect().top - offsetY) + 'px';
      };

      const onMouseUp = () => {
        item.x = parseInt(element.style.left);
        item.y = parseInt(element.style.top);
        this.saveDecoratedItems();
        element.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  selectDecoItem(item, element) {
    document.querySelectorAll('.decor-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    this.currentSelectedItem = item;
    this.updateItemDetails(item);
    document.getElementById('rotateBtn').disabled = false;
    document.getElementById('deleteBtn').disabled = false;
  }

  updateItemDetails(item) {
    const details = document.getElementById('itemDetails');
    details.innerHTML = `
      <p><strong>${item.name}</strong></p>
      <p>${item.emoji}</p>
      ${item.cost ? `<p>コスト: ${item.cost} ポイント</p>` : ''}
    `;
  }

  rotateSelected() {
    if (!this.currentSelectedItem) return;
    this.currentSelectedItem.rotation = (this.currentSelectedItem.rotation + 45) % 360;
    this.saveDecoratedItems();
    this.renderDecoratedItems();
    this.selectDecoItem(this.currentSelectedItem, 
      document.querySelector(`[data-id="${this.currentSelectedItem.id}"]`));
  }

  deleteSelected() {
    if (!this.currentSelectedItem) return;
    this.decoratedItems = this.decoratedItems.filter(item => item.id !== this.currentSelectedItem.id);
    this.saveDecoratedItems();
    this.renderDecoratedItems();
    this.currentSelectedItem = null;
    document.getElementById('rotateBtn').disabled = true;
    document.getElementById('deleteBtn').disabled = true;
  }

  resetAll() {
    if (confirm('すべての装飾をリセットしますか？')) {
      this.decoratedItems = [];
      this.saveDecoratedItems();
      this.renderDecoratedItems();
      this.currentSelectedItem = null;
      document.getElementById('rotateBtn').disabled = true;
      document.getElementById('deleteBtn').disabled = true;
    }
  }
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', () => {
  new DecoratorGame();
});
