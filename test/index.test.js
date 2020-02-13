const fs = require('fs')
const tap = require('tap')
const path = require('path')
const { v1 } = require('uuid')
const template = require('art-template') // 引用art-template模板引擎
const { build, listdata } = require('./helper')
const StylinerPkg = require('styliner')

const styliner = new StylinerPkg(path.join(__dirname, '../file'))

const originalSource = fs.readFileSync(path.join(__dirname, '../file/index.html'), 'utf8')

build(tap, (test, beanify) => {
  const messageId = v1()
  const { mail } = beanify

  test('邮件服务配置初始化', (t) => {
    t.plan(1)
    t.equal(mail.transporter.options.name, '测试邮件', '邮件服务配置初始化')
  })

  test('发送体数据格式填写错误测试', (t) => {
    t.plan(1)
    beanify.inject({
      url: 'mail.send',
      body: {
        from: 'your@qq.com', // 发件人邮箱地址
        to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
        cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
        bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
        messageId: messageId,
        subject: '发送简单文本', // 邮件主题
        text: '发送简单文本', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
        html: '<p>HTML version of the message</p>' // 消息的HTML版本，如Unicode字符串，Buffer，Stream或类似附件的对象 {path：'http：//…'}
      }
    }, function (err, res) {
      t.equal(err.message, 'Mail command failed: 501 Mail from address must be same as authorization user.', '发送体数据格式填写错误测试成功')
    })
  })

  test('简单字符串文本发送测试', (t) => {
    t.plan(2)
    beanify.inject({
      url: 'mail.send',
      body: {
        from: '1296114084@qq.com', // 发件人邮箱地址
        to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
        cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
        bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
        messageId: messageId,
        subject: '简单字符串文本', // 邮件主题
        text: '简单字符串文本', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
        html: '<html><head><title>我的第一个 HTML 页面</title></head><body><p>body 元素的内容会显示在浏览器中。</p><p>title 元素的内容会显示在浏览器的标题栏中。</p></body></html>'
        // 消息的HTML版本，如Unicode字符串，Buffer，Stream或类似附件的对象 {path：'http：//…'}
      }
    }, function (err, res) {
      t.error(err, '简单字符串文本发送测试失败')
      t.equal(messageId, res.messageId, '简单字符串文本发送测试成功')
    })
  })

  test('简单单独静态html文本发送测试', (t) => {
    t.plan(2)
    beanify.inject({
      url: 'mail.send',
      body: {
        from: '1296114084@qq.com', // 发件人邮箱地址
        to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
        cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
        bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
        messageId: messageId,
        subject: '简单单独静态html文本', // 邮件主题
        text: '简单单独静态html文本', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
        html: originalSource // 消息的HTML版本，如Unicode字符串，Buffer，Stream或类似附件的对象 {path：'http：//…'}
      }
    }, function (err, res) {
      t.error(err, '简单单独静态html文本发送测试失败')
      t.equal(messageId, res.messageId, '简单单独静态html文本发送测试成功')
    })
  })

  test('html文件与css文件发送测试', (t) => {
    t.plan(2)
    styliner.processHTML(originalSource).then(function (processedSource) {
      beanify.inject({
        url: 'mail.send',
        body: {
          from: '1296114084@qq.com', // 发件人邮箱地址
          to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
          cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
          bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
          messageId: messageId,
          subject: 'html文件与css文件发送', // 邮件主题
          text: 'html文件与css文件发送', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
          html: processedSource // 消息的HTML版本，如Unicode字符串，Buffer，Stream或类似附件的对象 {path：'http：//…'}
        }
      }, function (err, res) {
        t.error(err, 'html文件与css文件发送测试失败')
        t.equal(messageId, res.messageId, 'html文件与css文件发送测试成功')
      })
    })
  })

  test('模板引擎渲染html发送测试', (t) => {
    t.plan(3)
    fs.readFile(path.join(__dirname, '../file/view.html'), function (err, data) {
      t.error(err)
      // 将views文件下的view.html读取出来，用模板引擎编译，传入参数，以字符串形式返回到客户端
      const htmlstr = template.render(data.toString(), {
        header: '评论日志',
        title: 'list',
        files: listdata
      })
      styliner.processHTML(htmlstr).then(function (processedSource) {
        beanify.inject({
          url: 'mail.send',
          body: {
            from: '1296114084@qq.com', // 发件人邮箱地址
            to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
            cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
            bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
            messageId: messageId,
            subject: '模板引擎渲染html', // 邮件主题
            text: '模板引擎渲染html', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
            html: processedSource // 消息的HTML版本，如Unicode字符串，Buffer，Stream或类似附件的对象 {path：'http：//…'}
          }
        }, function (err, res) {
          t.error(err, '模板引擎渲染html发送测试失败')
          t.equal(messageId, res.messageId, '模板引擎渲染html发送测试成功')
        })
      })
    })
  })

  test('发送带附件邮件', (t) => {
    t.plan(2)
    beanify.inject({
      url: 'mail.send',
      body: {
        from: '1296114084@qq.com', // 发件人邮箱地址
        to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
        cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
        bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
        subject: '发送带附件邮件', // 邮件主题
        text: '发送带附件邮件', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...
        html: '<p>HTML version of the message</p>', // 消息的HTML版本，如Unicode字符串，Buffer，Stream或类似附件的对象 {path：'http：//…'}
        messageId: messageId,
        attachments: [
          {
            filename: '纯字符串文本.txt', // 自定义附件名以纯文本形式
            content: 'hello world!'
          },
          {
            filename: '自定义文件名.txt', // 自定义附件名以读取文件形式
            path: 'file/test.txt'
          },
          {
            path: 'file/test.txt' // 默认读取文件名作为附件名
          },
          {
            filename: '文件流形式.txt', // 自定义附件名以文件流形式
            content: fs.createReadStream('file/test.txt')
          },
          {
            filename: '其他文件.bin', // 自定义附件名以设置contentType形式
            content: 'hello world!',
            contentType: 'text/plain' // 默认从filename中读取
          },
          {
            filename: '在线文本.txt', // 自定义附件名以在线连接形式
            path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
          },
          {
            filename: '测试图片.jpg', // 自定义附件名以发送图片形式
            path: 'file/test.jpg'
          }
        ]
      }
    }, function (err, res) {
      t.error(err, '发送带附件邮件发送测试失败')
      t.equal(messageId, res.messageId, '发送带附件邮件发送测试成功')
    })
  })

  test('以字符串形式发送REQUEST事件', (t) => {
    t.plan(2)
    const content = 'BEGIN:VCALENDAR\r\nPRODID:-//ACME/DesktopCalendar//EN\r\nMETHOD:REQUEST\r\n...'
    beanify.inject({
      url: 'mail.send',
      body: {
        from: '1296114084@qq.com', // 发件人邮箱地址
        to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
        cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
        bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
        subject: '以字符串形式发送REQUEST事件', // 邮件主题
        text: '以字符串形式发送REQUEST事件', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
        messageId: messageId,
        icalEvent: {
          filename: 'invitation.ics',
          method: 'request',
          content: content
        }
      }
    }, function (err, res) {
      t.error(err, '以字符串形式发送REQUEST事件发送测试失败')
      t.equal(messageId, res.messageId, '以字符串形式发送REQUEST事件发送测试成功')
    })
  })

  test('从URL发送CANCEL事件', (t) => {
    t.plan(2)
    beanify.inject({
      url: 'mail.send',
      body: {
        from: '1296114084@qq.com', // 发件人邮箱地址
        to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
        cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
        bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
        subject: '从URL发送CANCEL事件', // 邮件主题
        text: '从URL发送CANCEL事件', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
        messageId: messageId,
        icalEvent: {
          method: 'CANCEL',
          href: 'https://nodemailer.com/message/calendar-events/'
        }
      }
    }, function (err, res) {
      t.error(err, '从URL发送CANCEL事件发送测试失败')
      t.equal(messageId, res.messageId, '从URL发送CANCEL事件发送测试成功')
    })
  })

  test('嵌入式图片', (t) => {
    t.plan(2)
    beanify.inject({
      url: 'mail.send',
      body: {
        from: '1296114084@qq.com', // 发件人邮箱地址
        to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
        cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
        bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
        subject: '嵌入式图片', // 邮件主题
        text: '嵌入式图片', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
        html: 'Embedded image: <img src="cid:dsfhgdsajfweui654sd4f56d"/>Embedded image: <img src="http://pic1.win4000.com/wallpaper/b/513438bb1ca49.jpg"/>',
        messageId: messageId,
        attachments: [{
          filename: 'test.jpg',
          path: 'file/test.jpg',
          cid: 'dsfhgdsajfweui654sd4f56d' // same cid value as in the html img src
        }]
      }
    }, function (err, res) {
      t.error(err, '嵌入式图片发送测试失败')
      t.equal(messageId, res.messageId, '嵌入式图片发送测试成功')
    })
  })

  test('准备好的标题', (t) => {
    t.plan(2)
    beanify.inject({
      url: 'mail.send',
      body: {
        from: '1296114084@qq.com', // 发件人邮箱地址
        to: ['longzinziyan@gmail.com'], // 收件人邮箱地址，可以是列表
        cc: ['2811416050@qq.com'], // 抄送人邮箱地址，可以是列表
        bcc: 'test2@gmail.com', // 密件抄送人邮箱地址，可以是列表
        subject: '准备好的标题', // 邮件主题
        text: '准备好的标题', // 消息的明文版本作为Unicode字符串，缓冲液，流或附件状物体 {路径：“的/ var /数据/ ...”}
        html: 'Embedded image: <img src="cid:dsfhgdsajfweui654sd4f56d"/>',
        messageId: messageId,
        attachments: [{
          filename: 'test.jpg',
          path: 'file/test.jpg',
          cid: 'dsfhgdsajfweui654sd4f56d' // same cid value as in the html img src
        }],
        headers: {
          'x-processed': 'a really long header or value with non-ascii characters 👮',
          'x-unprocessed': {
            prepared: true,
            value: 'a really long header or value with non-ascii characters 👮'
          }
        }
      }
    }, function (err, res) {
      t.error(err, '准备好的标题发送测试失败')
      t.equal(messageId, res.messageId, '准备好的标题发送测试成功')
    })
  })
})
