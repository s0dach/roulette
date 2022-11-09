## beta

## Запуск (сервер, клиент)

```
bash start_dev_docker.sh
```

//

## Ubuntu

Пуск - PowerShell и вводим

```
$ wsl --install
$ wsl --install -d ubuntu
```

Далее Пуск - Ubuntu

## Настройка Redis

Это все вводим в командную строку Ubuntu (По очереди)

```

curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

sudo apt-get update

sudo apt-get install redis

sudo service redis-server start

```

## БД

https://sourceforge.net/projects/xampp/files/latest/download - устанавливаем

Заходим - Включаем Apache и MySql.

Далее заходим в браузер localhost/phpmyadmin создаем бд Название root и Export файла.

## Запуск

```
$ cd web

$ npm run serve

$ cd ../server

$ npm run start
```

После запуска в браузере localhost:8080
