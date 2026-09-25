#!/usr/bin/env python3
"""Install reversible maintenance rules for the two AutoFlix vhosts."""
from pathlib import Path
import shutil, subprocess, datetime
base = Path('/www/server/panel/vhost/nginx')
repo = Path('/opt/autoflix')
flag = repo / 'maintenance.enabled'
backup = Path('/root/autoflix-maintenance-backups') / datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
backup.mkdir(parents=True)
files = [base / (host + '.conf') for host in ['autoflix.com.br', 'api.autoflix.com.br']]
originals = {p: p.read_text() for p in files}
try:
    for p, text in originals.items():
        shutil.copy2(p, backup / p.name)
        if '# AUTOFLIX-MAINTENANCE' in text:
            continue
        marker = 'location ^~ / {'
        if text.count(marker) != 1:
            raise RuntimeError('Unexpected location layout: ' + str(p))
        text = text.replace(marker, marker + '\n      # AUTOFLIX-MAINTENANCE\n      if (-f /opt/autoflix/maintenance.enabled) { return 503; }', 1)
        extra = '''
    error_page 503 =503 /__autoflix_disabled.html;
    location = /__autoflix_disabled.html {
        internal;
        alias /opt/autoflix/public/site-disabled.html;
        default_type text/html;
        charset utf-8;
        add_header Retry-After 3600 always;
        add_header Cache-Control "no-store, max-age=0" always;
    }
'''
        if p.name == 'autoflix.com.br.conf':
            extra += '''
    location = /robots.txt { proxy_pass http://127.0.0.1:8080; }
    location = /sitemap.xml { proxy_pass http://127.0.0.1:8080; }
    location = /sw.js {
        if (-f /opt/autoflix/maintenance.enabled) { return 418; }
        error_page 418 =200 /__autoflix_maintenance_sw.js;
        proxy_pass http://127.0.0.1:8080;
    }
    location = /__autoflix_maintenance_sw.js {
        internal;
        alias /opt/autoflix/ops/maintenance-sw.js;
        default_type application/javascript;
        add_header Cache-Control "no-store" always;
        add_header Service-Worker-Allowed "/" always;
    }
'''
        pos = text.rfind('}')
        p.write_text(text[:pos] + extra + text[pos:])
    subprocess.run(['nginx', '-t'], check=True)
    flag.touch()
    subprocess.run(['nginx', '-s', 'reload'], check=True)
except Exception:
    for p, text in originals.items():
        p.write_text(text)
    flag.unlink(missing_ok=True)
    subprocess.run(['nginx', '-t'], check=False)
    raise
print('Maintenance enabled. Backup:', backup)
