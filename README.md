# 网易邮箱登录页面 (NetEase Mail Login Page)

这是一个简单的前端项目，实现了网易邮箱的登录界面。

## 项目结构

- `frontend/`: 包含所有前端源代码 (HTML, CSS, JS)
- `Dockerfile`: Docker 构建配置
- `docker-compose.yml`: Docker Compose 启动配置

## 技术栈

- HTML5
- CSS3
- JavaScript (原生)
- Docker & Nginx

## 启动指南

本项目配置了 Docker 容器化启动，请确保本地已安装 Docker 和 Docker Compose。

### 启动命令

在项目根目录下执行以下命令：

```bash
docker-compose up -d --build
```

启动后，访问浏览器：[http://localhost:3000](http://localhost:3000)

### 替代启动方式：直接打开

无需 Docker 环境，直接进入 `frontend` 文件夹，双击 `index.html` 文件即可在浏览器中查看。

**优缺点分析：**

- **优点 (Pros):**
  - **零依赖**：无需安装 Docker、Node.js 或 Nginx，开箱即用。
  - **快速预览**：双击即可运行，适合快速查看页面效果。
  
- **缺点 (Cons):**
  - **协议限制**：使用 `file://` 协议运行，部分现代浏览器安全策略（CORS）可能会限制加载本地资源或 API 请求。
  - **环境差异**：无法模拟真实的生产环境（如 Nginx 路由、服务器配置等），与最终部署环境可能存在表现差异。


### 开发说明

- 页面设计参考了网易邮箱登录页的布局要求。
- 兼容 PC 和 H5 移动端显示。
- 端口映射为 3000。
