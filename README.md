### 关于 Shadow Book

Shadow Book 是一个基于 <a target="_blank" href="https://en.wikipedia.org/wiki/Markdown">markdown</a> 的简易用户手册制作系统，它是用 <a target="_blank" href="https://github.com/facebook/react">React</a> 与 <a target="_blank" href="https://github.com/rewgt/shadow-server">Shadow Widget</a> 开发的免费软件，并以 BSD 协议开源。

完整介绍请参考：<a target="_blank" href="https://rewgt.github.io/shadow-book/doc_zh/">Shadow Book 用户手册</a>

### 安装 Shadow Book

先安装 Shadow Widget：

```
  mkdir user
  cd user
  git clone https://github.com/rewgt/shadow-server.git
```

然后安装 Shadow Book：

```
  git clone https://github.com/rewgt/shadow-book.git
```

### 在本机启动 Web 服务

```
  cd shadow-server
  npm start
```

运行后，请在 Web 浏览器访问 `http://localhost:3000/shadow-book/doc_zh/`，看看是否正常打开一本手册了。该手册既介绍 shadow-book 产品怎么用，它自身还是用 shadow-book 制作的，是一份自我诠释的样例。
