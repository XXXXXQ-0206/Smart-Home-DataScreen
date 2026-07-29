# Smart-Home 数据大屏

[English](README.md) | [中文](README.zh-CN.md)

## 项目概览

Smart-Home Data Screen 是一个 Vue 3 数据大屏，通过 Smart-Home 实时 HTTP API 展示家庭设备状态。它重建了历史上的 mock 数据大屏，但发布版本只包含真实 API 实现，不包含 mock 运行入口或打包的示例遥测数据。

## 功能

- 实时展示设备、场景、告警和访客摘要。
- 按房间分组的设备状态卡片，显示在线和离线状态。
- 根据最新 API 响应计算设备活动图表。
- 每 30 秒自动刷新，并报告各接口的失败情况。
- 读取 Smart-Home Web 客户端使用的浏览器存储中的 token 和房屋选择。
- 适合大屏和桌面浏览器的深色响应式布局。

## 截图

暂未提供截图。该大屏面向需要认证的 Smart-Home 部署。

## 安装

要求 Node.js 22 或更高版本，以及 npm 11 或更高版本。

```bash
npm ci
```

大屏默认要求 Smart-Home API 与页面同源，或由反向代理转发。使用独立 API 地址构建时，请在构建前设置 `VITE_SMARTHOME_API_BASE_URL`。

## 使用

```bash
npm run dev
```

配置有效的 Smart-Home 会话后，打开命令输出的本地地址。API 客户端从 `localStorage` 读取 `token` 和 `houseid`，仓库中不包含任何凭证。

## 构建

```bash
npm run lint
npm run build
```

生产构建输出到 `dist/`。除非部署流程明确要求，否则不要提交 `dist/`。

## 项目结构

```text
src/
  components/       大屏卡片和图表
  router/            Vue Router 配置
  utlis/             Smart-Home API 客户端和响应归一化
  views/             大屏页面
public/              静态入口和图标
.github/             CI、CodeQL、Dependabot 和 issue 模板
```

## 路线图

- 在 API 提供历史遥测后支持可配置的图表时间窗口。
- 增加 Nginx 和容器化静态托管示例。
- 为响应归一化和部分接口失败场景增加组件测试。

## 贡献

请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。请使用功能分支并提交 Pull Request；项目不采用直接推送 `main` 的流程。

## 许可证

本项目采用 [MIT License](LICENSE) 授权。

## 常见问题

### 为什么大屏没有数据？

请确认 Smart-Home API 可访问、`localStorage` 中有当前有效的 `token` 和 `houseid`，并且 API 允许当前页面来源访问。

### 有 mock 模式吗？

没有。本仓库有意只保留实时 API 实现。没有 Smart-Home 实例时，请使用独立且受控的测试 API。

## 致谢

- Vue 3 和 Vite
- Apache ECharts
- Axios

## 免责声明

本软件按“现状”（AS IS）提供，不附带任何形式的明示或默示保证。作者和贡献者不对因使用本软件产生的任何直接、间接、偶然、特殊、后果性或其他损害承担责任。使用者自行承担风险，并负责验证命令、API 权限、数据处理和部署安全。禁止将本软件用于违法活动、不安全自动化、未授权访问，或任何故障可能造成人身伤害或财产损失的场景。
