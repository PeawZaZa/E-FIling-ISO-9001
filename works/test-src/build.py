import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
p=ROOT/'works/test-src'
cases=json.loads((p/'cases.json').read_text(encoding='utf-8'))
assert len({c['id'] for c in cases})==len(cases)
data=json.dumps(cases,ensure_ascii=False).replace('<','\\u003c')
html=(p/'template.html').read_text(encoding='utf-8-sig').replace('__CATALOG__',data)
(ROOT/'works/Test Cases.html').write_text(html,encoding='utf-8')
print(f'Built works/Test Cases.html ({len(cases)} cases)')
