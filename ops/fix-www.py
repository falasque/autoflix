import os, sys, pathlib, subprocess, shutil, datetime
os.chdir('/www/server/panel')
sys.path.insert(0, '/www/server/panel')
sys.path.insert(0, '/www/server/panel/class')
root=pathlib.Path('/www/wwwroot/autoflix.com.br')
conf=pathlib.Path('/www/server/panel/vhost/nginx/www.autoflix.com.br.conf')
if conf.exists():
    raise SystemExit('Existing www configuration: inspect before replacing')
backup=pathlib.Path('/root/autoflix-fix-backups')/datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
backup.mkdir(parents=True)
conf.write_text('''server {
 listen 80;
 listen 443 ssl;
 server_name www.autoflix.com.br;
 ssl_certificate /www/server/panel/vhost/cert/autoflix.com.br/fullchain.pem;
 ssl_certificate_key /www/server/panel/vhost/cert/autoflix.com.br/privkey.pem;
 location ^~ /.well-known/acme-challenge/ { root /www/wwwroot/autoflix.com.br; }
 location / { return 301 https://autoflix.com.br$request_uri; }
}
''')
subprocess.run(['nginx','-t'],check=True)
subprocess.run(['nginx','-s','reload'],check=True)
from acme_v2 import acme_v2
result=acme_v2().apply_cert(['www.autoflix.com.br'],auth_type='http',auth_to=str(root))
if not result.get('status'):
    print('Certificate failed:',result.get('msg'))
    raise SystemExit(1)
certdir=pathlib.Path('/www/server/panel/vhost/cert/www.autoflix.com.br')
certdir.mkdir(mode=0o700,exist_ok=True)
(certdir/'fullchain.pem').write_text(result['cert']+result['root'])
(certdir/'privkey.pem').write_text(result['private_key'])
os.chmod(certdir/'privkey.pem',0o600)
conf.write_text(conf.read_text().replace('/cert/autoflix.com.br/','/cert/www.autoflix.com.br/'))
subprocess.run(['nginx','-t'],check=True)
subprocess.run(['nginx','-s','reload'],check=True)
print('WWW certificate installed and canonical redirect active')
