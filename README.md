# ⭐ Star Catcher — Telegram Mini App

A tiny game for learning how to build and upload a Telegram Mini App.
Drag the basket to catch falling stars and avoid the bombs. Plain HTML, CSS and JavaScript; nothing to build.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page and loads the Telegram Web App SDK |
| `style.css` | Styles; uses Telegram theme colors when available |
| `game.js` | Game logic, plus Telegram features (haptics, MainButton, `sendData`) |

## 1. Run it locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. It works in any browser; Telegram-only features are skipped.

## 2. Host it on GitHub Pages (free HTTPS)

Telegram needs an **HTTPS** URL.

1. Push this repo to GitHub.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
3. After a minute your game is at `https://<your-username>.github.io/telegram-mini-game/`.

## 3. Connect it to a Telegram bot

1. In Telegram, open **@BotFather** and send `/newbot` to create a bot.
2. Send `/newapp`, pick your bot, and give it a title, description and photo.
3. When asked for the **Web App URL**, paste your GitHub Pages URL.
4. Choose a short name. Your game is then at `https://t.me/<your_bot>/<short_name>`.

Optional: `/mybots → your bot → Bot Settings → Menu Button` adds a button with the same URL to the bot's chat.

## Telegram features used

- `Telegram.WebApp.ready()` / `expand()`: start the app at full height
- Theme variables (`--tg-theme-*`): match the user's Telegram colors
- `HapticFeedback`: phone vibration when you catch or miss
- `MainButton` + `sendData()`: send your score to the bot. This only works when the app is opened from a keyboard button, and your bot needs code that reads `web_app_data` messages.
