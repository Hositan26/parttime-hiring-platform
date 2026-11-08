"""Local Docker database operations. Production is never a reset target."""
import argparse
from datetime import datetime
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
BACKUPS = ROOT / '.local/database-backups'
DEV = 'parttime_hiring_platform_dev'
PROD = 'parttime_hiring_platform_prod'
LEGACY = 'parttime_hiring_platform'
RESTORE_CHECK = 'parttime_flyway_restore_check'
PREFIX = 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec '


def execute(sql, database=None):
    if database not in (None, DEV, PROD, LEGACY, RESTORE_CHECK):
        raise ValueError('Database is outside the local allowlist')
    command = PREFIX + 'mysql -uroot --default-character-set=utf8mb4 --batch --raw --skip-column-names'
    if database:
        command += ' ' + database
    result = subprocess.run(['docker', 'exec', '-i', 'mysql-parttime', 'sh', '-c', command],
                            input=sql.encode('utf-8'), capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors='replace'))
    return result.stdout.decode('utf-8').strip()


def dump(database, path, extra=()):
    command = ["docker", "exec", "mysql-parttime", "sh", "-c",
               PREFIX + 'mysqldump -uroot --single-transaction --hex-blob --skip-lock-tables --no-tablespaces "$@"',
               'database-backup', database, *extra]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as stream:
        subprocess.run(command, stdout=stream, stderr=subprocess.PIPE, check=True)
    if path.stat().st_size < 100:
        raise RuntimeError('Backup is unexpectedly empty')


def counts(database):
    tables = execute('SHOW TABLES;', database).splitlines()
    return {table: int(execute(f'SELECT COUNT(*) FROM `{table}`;', database)) for table in tables}


def backup(database):
    path = BACKUPS / f'{database}-{datetime.now():%Y%m%d-%H%M%S-%f}.sql'
    dump(database, path)
    print('Backup:', path)
    return path


def verify_backup():
    source = BACKUPS / 'before-flyway.sql'
    if not source.is_file():
        raise RuntimeError('Original backup is missing')
    execute(f'CREATE DATABASE `{RESTORE_CHECK}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;')
    execute(source.read_text(encoding='utf-8'), RESTORE_CHECK)
    expected = json.loads((BACKUPS / 'table-counts.json').read_text())
    if counts(RESTORE_CHECK) != expected:
        raise RuntimeError('Restored backup counts differ; keeping verification database')
    execute(f'DROP DATABASE `{RESTORE_CHECK}`;')
    (BACKUPS / 'restore-verified.txt').write_text(datetime.now().isoformat())
    print('Backup restored successfully; all table counts match')


def preserve_legacy():
    # Original business rows are local snapshots, never committed migration fixtures.
    target = BACKUPS / 'legacy-business.sql'
    if target.exists():
        raise RuntimeError('Refusing to overwrite preserved business rows')
    user_filter = "user_id NOT IN (SELECT CAST(row_id AS UNSIGNED) FROM demo_seed_records WHERE table_name='users')"
    fragments = []
    for table, where in [('users', user_filter), ('employers', user_filter),
                         ('user_roles', user_filter), ('user_oauth_accounts', user_filter)]:
        path = BACKUPS / f'legacy-{table}.sql'
        dump(LEGACY, path, (table, '--no-create-info', '--skip-add-locks', '--skip-disable-keys', '--complete-insert', '--where=' + where))
        fragments.append(path.read_text(encoding='utf-8'))
    target.write_text('\n'.join(fragments), encoding='utf-8')
    print('Preserved original users, employers, roles and OAuth identities locally')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['init', 'backup', 'verify-backup', 'preserve-legacy', 'restore-legacy', 'reset-dev', 'counts'])
    parser.add_argument('--confirm-dev-reset', action='store_true')
    args = parser.parse_args()
    context = subprocess.run(['docker', 'context', 'inspect'], capture_output=True, text=True, check=True)
    endpoint = json.loads(context.stdout)[0]['Endpoints']['docker']['Host']
    if not (endpoint.startswith('npipe:////./pipe/') or endpoint.startswith('unix:///')):
        raise RuntimeError('Database operations require a local Docker socket')
    if args.action == 'init':
        for database in (DEV, PROD):
            execute(f'CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;')
        print('Created local dev and prod schemas; no existing data changed')
    elif args.action == 'backup':
        backup(DEV)
    elif args.action == 'verify-backup':
        verify_backup()
    elif args.action == 'preserve-legacy':
        preserve_legacy()
    elif args.action == 'restore-legacy':
        if execute('SELECT COUNT(*) FROM users;', DEV) != '0':
            raise RuntimeError('Restore requires empty dev users before demo migration')
        execute((BACKUPS / 'legacy-business.sql').read_text(encoding='utf-8'), DEV)
        print('Restored original business accounts into dev')
    elif args.action == 'reset-dev':
        if not args.confirm_dev_reset:
            parser.error('Explicit --confirm-dev-reset is required; stop backend first')
        backup(DEV)
        execute(f'DROP DATABASE `{DEV}`; CREATE DATABASE `{DEV}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;')
        print('Reset dev only. Start backend with dev profile to migrate and seed.')
    else:
        print(json.dumps({database: counts(database) for database in (DEV, PROD)}, indent=2))


if __name__ == '__main__':
    main()
