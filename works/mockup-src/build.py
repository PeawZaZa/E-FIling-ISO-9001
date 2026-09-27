"""Build a single offline HTML using the original standalone's bundled React/Babel.
Run from repository root: python works/mockup-src/build.py
"""
from pathlib import Path
import base64,gzip,json,re,subprocess,tempfile
root=Path(__file__).resolve().parents[2]; src=Path(__file__).parent
original=(root/'works/E-Filing ISO (Standalone).html').read_text(encoding='utf-8')
manifest=json.loads(re.search(r'<script type="__bundler/manifest">(.*?)</script>',original,re.S)[1])
def unpack(key):
 item=manifest[key]; data=base64.b64decode(item['data'])
 return (gzip.decompress(data) if item.get('compressed') else data).decode('utf-8')
react=unpack('19efe984-40be-4860-978c-49611bcb2e8f'); dom=unpack('1620c6d4-fef0-4c3e-87b6-9d9c2b460439')
with tempfile.TemporaryDirectory() as tmp:
 babel=Path(tmp)/'babel.cjs';babel.write_text(unpack('9c06d98c-d79f-49d1-b1e0-0a1325206290'),encoding='utf-8')
 compiled=Path(tmp)/'app.js'
 subprocess.run(['node','-e',"const fs=require('fs'),b=require(process.argv[1]);fs.writeFileSync(process.argv[3],b.transform(fs.readFileSync(process.argv[2],'utf8'),{presets:['react']}).code)",str(babel),str(src/'app.jsx'),str(compiled)],check=True)
 app=compiled.read_text(encoding='utf-8')
# Retain the original embedded font faces, so no CDN is needed to open the mockup.
template=json.loads(re.search(r'<script type="__bundler/template">(.*?)</script>',original,re.S)[1])
fonts='\n'.join(re.findall(r'@font-face\s*\{[^}]+\}',template))
for key,item in manifest.items():
 if key in fonts:
  data=base64.b64decode(item['data']);data=gzip.decompress(data) if item.get('compressed') else data
  fonts=fonts.replace(key,'data:'+item['mime']+';base64,'+base64.b64encode(data).decode())
script=lambda s:'<script>'+s.replace('</script','<\\/script')+'</script>'
html='<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ISO E-Filing — MVP Mockup</title><style>'+fonts+(src/'style.css').read_text(encoding='utf-8')+'</style></head><body><div id="root"></div>'+script(react)+script(dom)+script(app)+'</body></html>'
out=root/'works/E-Filing ISO (MVP Mockup).html';out.write_text(html,encoding='utf-8');print('Built',out)
