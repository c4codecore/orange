# Android APK Setup Checklist
### Expo / React Native Apps — Local Network (HTTP) Support
> Ye file future me naye APK banate waqt follow karo — pehli baar me hi sab sahi ho jaayega.

---

## ⚡ The Main Problem (Jo 1 Week Laga Solve Karne Me)

Android 9+ me **HTTP (cleartext) traffic by default block** hoti hai.
Local backend `http://192.168.x.x:PORT` pe call karo toh yeh error aata hai:

```
Error: fetch failed: java.net.UnknownServiceException: 
CLEARTEXT communication to 192.168.x.x not permitted by network security policy
```

---

## ✅ Fix — 3 Cheezein Karni Hain (Ek Baar, Hamesha Ke Liye)

---

### Step 1 — `expo-build-properties` Install Karo

```powershell
cd your-frontend-folder
npx expo install expo-build-properties
```

> ⚠️ `npm install` mat karo — `npx expo install` use karo taaki SDK-compatible version mile.

---

### Step 2 — `app.json` Me Plugin Add Karo

`plugins` array **`expo` object ke andar, top level pe** add karo:

```json
{
  "expo": {
    "name": "YourApp",
    "slug": "your-app",
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ]
    ],
    "android": {
      "usesCleartextTraffic": true,
      "package": "com.yourname.yourapp"
    }
  }
}
```

> 💡 `usesCleartextTraffic: true` dono jagah dalo — `plugins` me bhi aur `android` me bhi.
> Plugin `AndroidManifest.xml` me directly inject karta hai — yahi guaranteed fix hai.

---

### Step 3 — `BASE_URL` Sahi Rakho

Frontend me API URL hardcode karo apne PC ka IP:

```js
// src/services/api.js ya constants.js
const BASE_URL = 'http://192.168.1.X:PORT';  // apna PC ka IP
```

PC ka IP check karne ke liye:
```powershell
ipconfig
# "IPv4 Address" wali line dekho
```

> ⚠️ Ye IP tab kaam karega jab phone aur PC **same WiFi** pe ho.

---

## 📋 Pre-Build Checklist

Har naya APK banane se pehle yeh confirm karo:

- [ ] `expo-build-properties` installed hai (`package.json` me check karo)
- [ ] `app.json` me `plugins` array hai `expo-build-properties` ke saath
- [ ] `usesCleartextTraffic: true` dono jagah hai
- [ ] `BASE_URL` me sahi PC IP hai
- [ ] Sabhi changes **git commit + push** ho gaye hain
- [ ] Purana APK phone se **uninstall** kar diya

---

## 🔨 Build Commands

```powershell
# EAS cloud build (recommended)
cd your-frontend-folder
git add .
git commit -m "your message"
git push
eas build --profile preview --platform android

# Build status check
eas build:list --platform android --limit 3
```

> ⚠️ EAS **git se code uthata hai** — local changes commit + push kiye bina build me nahi jaate.

---

## 🐛 Debugging — Jab APK Kaam Na Kare

### ADB Setup (Ek Baar Karo)
1. Download: https://developer.android.com/tools/releases/platform-tools
2. Extract to `C:\platform-tools\`
3. Phone me **Developer Options** → **USB Debugging ON**
4. USB se connect karo → popup aaye toh **Allow** karo

### Logs Dekhna
```powershell
# Device connected hai check karo
C:\platform-tools\adb.exe devices

# React Native logs
C:\platform-tools\adb.exe logcat -s ReactNativeJS
```

### Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `CLEARTEXT communication not permitted` | Step 1-2 upar follow karo |
| `Could not import module "main"` | `uvicorn app.main:app` use karo (agar `app/main.py` hai) |
| `INFO:` PowerShell error | Cosmetic hai, ignore karo. Ya `2>&1` add karo command me |
| Device `unauthorized` adb me | Phone pe "Allow USB Debugging" popup allow karo |
| Expo Go incompatible | SDK 56+ Expo Go support nahi karta — EAS se APK banao |
| Login silently fail | ADB logcat se exact error dekho |

---

## 🌐 Same WiFi Rule

```
✅ PC (backend) + Phone (APK)  →  Same WiFi  →  Works
❌ PC (backend) + Phone (mobile data)  →  IP not accessible  →  Fails
```

Agar alag network pe bhi chalana ho toh **Railway/Render pe backend deploy** karo aur APK me woh public URL use karo.

---

## 📁 Important Files Reference

```
your-app/
├── frontend/
│   ├── app.json              ← plugins + usesCleartextTraffic yahan
│   ├── eas.json              ← build profiles yahan
│   ├── src/
│   │   └── services/
│   │       └── api.js        ← BASE_URL yahan
│   └── package.json          ← expo-build-properties yahan hona chahiye
└── backend/
    └── app/
        └── main.py           ← uvicorn entry point
```

---

*Banaya: June 2026 | Orange App debugging se seekha gaya* 😄