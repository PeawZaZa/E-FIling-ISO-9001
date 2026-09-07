#!/usr/bin/env bash
PG="${PG_HOME:-/c/Users/marie/pgsql-portable}"
PGPASSWORD=efiling "$PG/pgsql/bin/psql" -h 127.0.0.1 -p "${PGPORT:-5432}" -U efiling -d efiling "$@"
