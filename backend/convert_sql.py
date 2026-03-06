import re

with open('full_schema_and_data.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []

for line in lines:
    # Skip sqlite specific
    if line.startswith('BEGIN TRANSACTION') or line.startswith('COMMIT') or line.startswith('DELETE FROM "sqlite_sequence"') or line.startswith('INSERT INTO "sqlite_sequence"'):
        continue
    
    # Postgres syntax replacements
    line = line.replace('AUTOINCREMENT', '')
    line = re.sub(r'"id" integer NOT NULL PRIMARY KEY', '"id" serial PRIMARY KEY', line)
    line = line.replace('datetime NOT NULL', 'timestamp with time zone NOT NULL')
    line = line.replace('datetime NULL', 'timestamp with time zone NULL')
    line = line.replace('bool NOT NULL', 'boolean NOT NULL')
    line = line.replace('bool NULL', 'boolean NULL')
    line = line.replace('unsigned', '')
    
    out.append(line)

with open('schema_completo.sql', 'w', encoding='utf-8') as f:
    f.writelines(out)
