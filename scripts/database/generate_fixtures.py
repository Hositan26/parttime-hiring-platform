from pathlib import Path
import sys
sys.dont_write_bytecode = True
from datetime import date,datetime
root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(root/'ParttimeHiringBackend/src/main/resources/db/dev/data'))
from dataset import build_dataset,Ref
def literal(value,references=None):
 if isinstance(value,Ref): return references[value.key]
 if value is None:return 'NULL'
 if isinstance(value,bool):return '1' if value else '0'
 if isinstance(value,(int,float)):return str(value)
 if isinstance(value,(date,datetime)):value=value.isoformat()
 return "'"+str(value).replace("'","''")+"'"

res=root/'ParttimeHiringBackend/src/main/resources'
data=build_dataset(date(2026,1,1),'__DEMO_ASSET_BASE__','__DEMO_PASSWORD_HASH__')
common=[]
for role in ['ADMIN','USER','EMPLOYER']:
 common.append(f"INSERT INTO role(role_name,description) VALUES ('{role}','{role}');")
refs={}; statements=['SET @demo_reference_date=CURRENT_DATE;']
for idx,r in enumerate(data.records):
 if r.table in ['job_categories','work_shifts']:
  values=dict(r.values)
  for k in ['category_name','shift_name']:
   if k in values: values[k]=values[k].replace(' \u00b7 Demo','')
  if 'slug' in values:values['slug']=values['slug'].removeprefix('demo-')
  if 'description' in values:values['description']='Shared job category'
  common.append('INSERT INTO `'+r.table+'` ('+','.join('`'+x+'`' for x in values)+') VALUES ('+','.join(literal(v) for v in values.values())+');')
  idcol=r.primary_key
  namecol='slug' if r.table=='job_categories' else 'shift_name'
  refs[r.key]=f'(SELECT `{idcol}` FROM `{r.table}` WHERE `{namecol}`={literal(values[namecol])})'
  continue
 vals=[]
 for k,v in r.values.items():
  if k=='resume_data': vals.append('NULL');continue
  if k=='dob': vals.append(literal(v));continue
  if isinstance(v,(datetime,date)):
   offset=(v.date() if isinstance(v,datetime) else v)-date(2026,1,1)
   expr=f'DATE_ADD(@demo_reference_date,INTERVAL {offset.days} DAY)'
   if isinstance(v,datetime): expr=f"TIMESTAMP({expr},'{v:%H:%M:%S}')"
   vals.append(expr)
  elif v=='__DEMO_PASSWORD_HASH__': vals.append("'__DEMO_PASSWORD_HASH__'")
  elif isinstance(v,str) and '__DEMO_ASSET_BASE__' in v: vals.append("'"+v+"'")
  else: vals.append(literal(v,refs))
 statements.append('INSERT INTO `'+r.table+'` ('+','.join('`'+x+'`' for x in r.values)+') VALUES ('+','.join(vals)+');')
 if r.primary_key:
  variable=f'@demo_{idx:04}'
  statements.append(f'SET {variable}=LAST_INSERT_ID();')
  refs[r.key]=variable
# Released common migrations are immutable; only regenerate un-applied files deliberately.
if not (res/'db/migration/V2__shared_reference_data.sql').exists():
 (res/'db/migration/V2__shared_reference_data.sql').write_text('\n'.join(common)+'\n',encoding='utf-8')
(res/'db/dev/data').mkdir(parents=True,exist_ok=True)
(res/'db/dev/data/demo.sql').write_text('-- Development fixtures only. Dates are relative to first migration day.\n'+'\n'.join(statements)+'\n',encoding='utf-8')
