#!/bin/bash

echo "Waiting for MySQL to start..."
until mysql -h db -u root -pCineBook@1234 -e "SELECT 1" > /dev/null 2>&1; do
    echo "MySQL not ready, retrying in 3 seconds..."
    sleep 3
done

echo "MySQL is ready!"

# Skip if already seeded
if mysql -h db -u root -pCineBook@1234 -e "SELECT 1 FROM users LIMIT 1" cinebook_db > /dev/null 2>&1; then
    echo "Already initialized, skipping."
    exit 0
fi

mysql -h db -u root -pCineBook@1234 < /sql/01_init.sql
echo "01_init.sql done"

mysql -h db -u root -pCineBook@1234 < /sql/02_seed.sql
echo "02_seed.sql done"

mysql -h db -u root -pCineBook@1234 < /sql/03_migration.sql
echo "03_migration.sql done"

mysql -h db -u root -pCineBook@1234 < /sql/04_init2.sql
echo "04_init2.sql done"

mysql -h db -u root -pCineBook@1234 < /sql/05_seed2.sql
echo "05_seed2.sql done"

mysql -h db -u root -pCineBook@1234 < /sql/06_migration2.sql
echo "06_migration2.sql done"

mysql -h db -u root -pCineBook@1234 < /sql/07_init3.sql
echo "07_init3.sql done"

mysql -h db -u root -pCineBook@1234 < /sql/08_seed3.sql
echo "08_seed3.sql done"