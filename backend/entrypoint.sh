#!/bin/sh
set -e

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

php artisan config:clear
php artisan migrate --force
php artisan db:seed --force

exec php -S 0.0.0.0:8000 -t public
