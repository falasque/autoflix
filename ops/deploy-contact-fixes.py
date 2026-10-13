"""Deploy only reviewed frontend files; abort if production differs from the base."""
from pathlib import Path
import subprocess, shutil, datetime, os
repo=Path('/opt/autoflix')
live=Path('/home/ubuntu/autoflix')
base='653ee3e'
paths=subprocess.check_output(['git','diff','--name-only',base,'HEAD','--','src','public/sw.js'],cwd=repo,text=True).splitlines()
normalize=lambda b:b.replace(b'\r\n',b'\n').removeprefix(b'\xef\xbb\xbf')
for name in paths:
    prior=subprocess.run(['git','show',base+':'+name],cwd=repo,capture_output=True)
    target=live/name
    if prior.returncode == 0 and (not target.exists() or normalize(target.read_bytes()) != normalize(prior.stdout)):
        raise SystemExit('Production differs from base: '+name)
    if prior.returncode != 0 and target.exists():
        raise SystemExit('New file already exists in production: '+name)
backup=Path('/root/autoflix-fix-backups')/datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
backup.mkdir(parents=True)
# New imports land before components and routing.
paths.sort(key=lambda p:(p=='src/App.tsx',p!='src/lib/whatsapp.ts',p!='src/pages/Privacy.tsx',p))
for name in paths:
    target=live/name
    if target.exists():
        dest=backup/name
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(target,dest)
    target.parent.mkdir(parents=True,exist_ok=True)
    temp=target.with_name(target.name+'.deploy-tmp')
    shutil.copy2(repo/name,temp)
    os.replace(temp,target)
print('Deployed',len(paths),'files. Backup:',backup)
