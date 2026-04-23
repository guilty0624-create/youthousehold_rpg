# Household Chore RPG (Browser App)

A browser app for gamifying household chores.

## How to use
1. Open `index.html` in your browser.
2. Select a chore from the available tasks.
3. Click the button to complete the chore and earn XP.
4. Level up to receive rewards.

## Features
- Predefined chore selection with configurable XP
- XP progression and level-up system
- Level rewards displayed in the status panel
- Completed chores history stored in local storage
- Reset progress button to clear XP, level, and history
- Celebration modal with random images on task completion

## Setting up celebration images
To use custom celebration images:
1. Create or find 3-4 celebratory images (PNG/JPG format)
2. Place them in the `images/` folder with names:
   - `celebration1.png`
   - `celebration2.png`
   - `celebration3.png`
   - (Optional) `celebration4.png`
3. Recommended image size: 100x100px or larger
4. The images will display randomly when tasks are completed

Example folder structure:
```
youthousehold_rpg/
├── images/
│   ├── celebration1.png
│   ├── celebration2.png
│   └── celebration3.png
├── index.html
├── style.css
├── script.js
└── README.md
```

## Viewing on a smartphone
1. 同じWi-FiにスマホとPCを接続します。
2. PCで簡単なWebサーバーを起動します（例: Python があれば `python -m http.server 8000`）。
3. PCのローカルIPアドレスを調べます。
4. スマホのブラウザで `http://<PCのIPアドレス>:8000/` を開きます。

もし GitHub Pages を使えるなら、リポジトリに公開してスマホでURLを開くのが最も簡単です。

## Files
- `index.html`: Main page structure.
- `style.css`: App styling.
- `script.js`: Chore selection, XP, and reward logic.
