Shadow Book 用户手册
-----------------------------

-----

&nbsp;

Shadow Book 是一个基于 <a target="_blank" href="https://en.wikipedia.org/wiki/Markdown">markdown</a> 的简易用户手册制作系统，它是用 <a target="_blank" href="https://github.com/facebook/react">React</a> 与 <a target="_blank" href="https://github.com/rewgt/shadow-widget">Shadow Widget</a> 开发的免费软件，并以 BSD 协议开源。

#### 安装 Shadow Book

先安装 Shadow Widget：

```
  md user
  cd user
  git clone https://github.com/rewgt/shadow-server.git
```

然后安装 Shadow Book：

```
  git clone https://github.com/rewgt/shadow-book.git
```

#### 在本机启动 Web 服务

```
  cd shadow-server
  npm start
```

运行后，请在 Web 浏览器访问 `http://localhost:3000/shadow-book/doc_zh/`，看看是否正常打开一本手册了。该手册既介绍 shadow-book 产品怎么用，它自身还是用 shadow-book 制作的，是一份自我诠释的样例。

#### 版权

Copyright 2016, PINP.ME Development Group. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

  - Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following
    disclaimer in the documentation and/or other materials provided
    with the distribution.
  - Neither the name of PINP.ME nor the names of its contributors 
    may be used to endorse or promote products derived from this 
    software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

&nbsp;
