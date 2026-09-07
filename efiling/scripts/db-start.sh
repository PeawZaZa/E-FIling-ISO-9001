#!/usr/bin/env bash
# เริ่มฐานข้อมูล PostgreSQL แบบพกพา (ไม่ต้องใช้สิทธิ์ผู้ดูแลระบบ)
PG="${PG_HOME:-/c/Users/marie/pgsql-portable}"
"$PG/pgsql/bin/pg_ctl" -D "$PG/data" -l "$PG/server.log" -o "-p ${PGPORT:-5432}" start
