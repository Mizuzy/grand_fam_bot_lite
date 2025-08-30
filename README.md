# Grand Family Bot – Ein einfacher und starker Familien Bot

Ein modularer Discord-Bot für GrandRP mit automatisierten Event-Remindern, Slash-Commands und konfigurierbaren Ankündigungen.

## 🚀 Features

- 🧾 Automatisierte Event-Reminder für verschiedene Events (Bizwar, Forty, RPTicket, Waffenfabrik, Gießerei, Cayo, EKZ, Hotel, Weinberge)
- ⚙️ Konfigurierbare Event-Benachrichtigungen via `/config` Slash-Command
- 🔗 Integration mit MySQL-Datenbank für Event- und Map-Daten
- 🛡️ Rollenbasierte Berechtigungsprüfung für Admin-Commands
- 🔄 Dynamischer Status-Rotator für den Bot

## 🧱 Projektstruktur

```
grand_fam_bot/
├── .env                  # Umgebungsvariablen (Token, DB-Zugang, IDs)
├── src/
│   ├── index.js          # Haupt-Entry, Bot-Initialisierung & Handler-Setup
│   ├── settings.json     # Konfiguration für Event-Benachrichtigungen
│   ├── commands/
│   │   └── config.js     # Slash-Command zum Konfigurieren von Event-Benachrichtigungen
│   ├── handler/
│   │   ├── bizwarHandler.js
│   │   ├── cayoHandler.js
│   │   ├── commandHandler.js
│   │   ├── ekzHandler.js
│   │   ├── fortyHandler.js
│   │   ├── giessereiHandler.js
│   │   ├── hotelHandler.js
│   │   ├── rpTicketHandler.js
│   │   ├── waffenfabrikHandler.js
│   │   └── weinbergeHandler.js
│   └── utils/
│       └── mysql.js      # MySQL-Datenbankverbindung
├── package.json          # Projekt- und Abhängigkeitsverwaltung
└── README.md
```

## ⚙️ Installation

1. Repository klonen
```bash
git clone https://github.com/Mizuzy/GrandRP-Fam-Bot
cd grand_fam_bot_lite
```

2. Abhängigkeiten installieren
```bash
npm install
```

3. `.env` Datei anlegen (siehe Beispiel unten)

4. Bot starten
```bash
node src/index.js
```

## 🛠️ Konfiguration

Lege eine `.env` Datei mit allen nötigen Variablen an (siehe Beispiel im Original-README).

## ✅ Admin Slash-Commands

| Befehl      | Beschreibung                                 |
|-------------|----------------------------------------------|
| `/config`   | Konfiguriert, welche Event-Reminders gesendet werden |

## 📅 Automatisierte Event-Reminder

Die folgenden Handler verschicken automatisierte Nachrichten zu festgelegten Zeiten, sofern sie in `settings.json` aktiviert sind:

- [`handler/bizwarHandler.js`](src/handler/bizwarHandler.js)
- [`handler/fortyHandler.js`](src/handler/fortyHandler.js)
- [`handler/rpTicketHandler.js`](src/handler/rpTicketHandler.js)
- [`handler/waffenfabrikHandler.js`](src/handler/waffenfabrikHandler.js)
- [`handler/giessereiHandler.js`](src/handler/giessereiHandler.js)
- [`handler/cayoHandler.js`](src/handler/cayoHandler.js)
- [`handler/ekzHandler.js`](src/handler/ekzHandler.js)
- [`handler/hotelHandler.js`](src/handler/hotelHandler.js)
- [`handler/weinbergeHandler.js`](src/handler/weinbergeHandler.js)

## 📞 Kontakt

Support über Discord: [Cavara Hub](https://discord.gg/cavarahub)