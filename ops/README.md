# Suspensão temporária

A página está em public/site-disabled.html. Nenhuma página original ou banco é apagado.
O servidor aplica HTTP 503 no site e na API, com Retry-After e Cache-Control: no-store.
robots.txt, sitemap.xml e a atualização do service worker continuam disponíveis.
A suspensão prolongada pode prejudicar a indexação; 503 é adequado para interrupções curtas.

Instalação inicial (root):
```
cd /opt/autoflix
python3 ops/install-maintenance.py
```

Reativar imediatamente, sem build ou reinício:
```
rm /opt/autoflix/maintenance.enabled
```

Suspender novamente:
```
touch /opt/autoflix/maintenance.enabled
```

As regras se aplicam aos domínios no Nginx. Os serviços internos continuam executando.
Backups das configurações originais ficam em /root/autoflix-maintenance-backups.
