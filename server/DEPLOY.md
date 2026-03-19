# Deploy to DigitalOcean

## 1. 创建 Droplet

- 镜像：Ubuntu 24.04 LTS
- 规格：Basic $6/month (1 vCPU, 1GB RAM) — $200 credits 够用 33 个月
- 数据中心：选离你近的（SGP1 新加坡 or SFO3）
- Authentication：SSH key（推荐）

## 2. 首次登录后运行

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2（进程管理）
sudo npm install -g pm2

# 安装 git
sudo apt-get install -y git
```

## 3. 部署代码

```bash
# 克隆项目（只需要 server/ 目录）
git clone https://github.com/YOUR_USERNAME/ColorArchive.git
cd ColorArchive/server

# 安装依赖
npm install

# 创建 .env（从 .env.example 复制后填入真实值）
cp .env.example .env
nano .env

# 启动服务
pm2 start index.js --name colorarchive-server
pm2 save
pm2 startup  # 跟着提示操作，让服务开机自启
```

## 4. 配置 Nginx 反向代理（让 80/443 端口对外）

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/colorarchive
```

粘贴以下内容（替换 YOUR_DROPLET_IP 或域名）：

```nginx
server {
    listen 80;
    server_name api.colorarchive.me;  # 或直接用 IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/colorarchive /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS（需要域名指向 Droplet IP）
sudo certbot --nginx -d api.colorarchive.me
```

## 5. 在 Namecheap 加 DNS 记录

| Type | Host | Value |
|------|------|-------|
| A | api | YOUR_DROPLET_IP |

等几分钟 DNS 生效后，`https://api.colorarchive.me/health` 应该返回 `{"ok":true}`。

## 6. 配置 Lemon Squeezy Webhook

LS Dashboard → Settings → Webhooks → Add webhook：

- URL: `https://api.colorarchive.me/webhook/ls`
- Events: `order_created`
- 复制 Signing secret → 填入 `.env` 的 `LS_WEBHOOK_SECRET`

然后重启服务：`pm2 restart colorarchive-server`
