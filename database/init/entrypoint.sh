#!/bin/bash

echo "Waiting for MSSQL to start..."
until /opt/mssql-tools/bin/sqlcmd -S db -U sa -P "CineBook@1234" -C -Q "SELECT 1" > /dev/null 2>&1; do
    echo "MSSQL not ready, retrying in 3 seconds..."
    sleep 3
done

echo "MSSQL is ready!"

/opt/mssql-tools/bin/sqlcmd -S db -U sa -P "CineBook@1234" -C -i /sql/01_init.sql
echo "01_init.sql done"

/opt/mssql-tools/bin/sqlcmd -S db -U sa -P "CineBook@1234" -C -i /sql/02_seed.sql
echo "02_seed.sql done"

/opt/mssql-tools/bin/sqlcmd -S db -U sa -P "CineBook@1234" -C -i /sql/03_migration.sql
echo "03_migration.sql done"

/opt/mssql-tools/bin/sqlcmd -S db -U sa -P "CineBook@1234" -C -i /sql/04_init2.sql
echo "04_init2.sql done"

/opt/mssql-tools/bin/sqlcmd -S db -U sa -P "CineBook@1234" -C -i /sql/05_seed2.sql
echo "05_seed2.sql done"

/opt/mssql-tools/bin/sqlcmd -S db -U sa -P "CineBook@1234" -C -i /sql/06_migration2.sql
echo "06_migration2.sql done"