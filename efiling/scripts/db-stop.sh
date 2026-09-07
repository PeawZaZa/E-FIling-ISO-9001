#!/usr/bin/env bash
PG="${PG_HOME:-/c/Users/marie/pgsql-portable}"
"$PG/pgsql/bin/pg_ctl" -D "$PG/data" stop -m fast
