# Smart-Home MQTT Proxy

English | 中文

这是 Smart-Home 数据大屏与开发板之间使用的本地 MQTT 到 WebSocket 桥接器。它订阅开发板遥测数据并广播给浏览器，也允许数据大屏把经过校验的具体主题命令发布回 MQTT。

## 安装和运行

需要 Node.js 18 或更高版本，以及一个本机可访问的 MQTT Broker：

```bash
npm install
copy .env.example .env
npm start
```

请在 `.env` 中配置本地 broker 地址、主题过滤器和开发环境凭证。本仓库不包含真实 broker 地址或账号密码。

默认 WebSocket 地址为 `ws://127.0.0.1:3001`，默认订阅 `kitchen/#`。浏览器发送的 JSON 必须包含具体 MQTT `topic` 和字符串、数字或布尔值 `message`；发布操作不允许 `+` 或 `#` 通配符。

## 安全边界

默认只监听本机，不应直接暴露到公网。若必须远程访问，应另行增加认证、Origin 校验、限流和 broker 权限策略。请勿提交 `.env`、broker 凭证或私有网络信息。

软件按 **AS IS** 提供，使用者自行承担设备控制、网络隔离和授权风险；禁止未经授权控制设备或网络。详见 [SECURITY.md](SECURITY.md)。

## 许可证

MIT，详见 [LICENSE](LICENSE)。
