'use strict'

const Beanify = require('beanify')

async function myCustomMethod (ctx) {
  const cmd = await ctx.sendCommand(
    'AUTH PLAIN ' +
    Buffer.from(
      '\u0000' + ctx.auth.credentials.user + '\u0000' + ctx.auth.credentials.pass,
      'utf-8'
    ).toString('base64')
  )
  if (cmd.status < 200 || cmd.status >= 300) {
    throw new Error('Failed to authenticate user: ' + cmd.text)
  }
}

const listdata = [
  { Id: 6, name: '爱豆1', message: '士大夫敢死队风格', date: '2019-09-14' },
  { Id: 7, name: '米', message: '米米', date: '2019-09-16' },
  { Id: 8, name: '张宝', message: '第三方公司的', date: '2019-09-17' },
  { Id: 10, name: 'REACT', message: '大家好大家好', date: '2019-09-17' },
  { Id: 11, name: '是德国', message: '尔特瑞特为人我', date: '2019-09-18' },
  { Id: 13, name: '他也认同', message: '复合体特反感风波不断的', date: '2019-10-14' }]

function build (t, cb) {
  const beanifyOpts = {
    nats: {
      url: 'nats://127.0.0.1:4222',
      user: 'bimgroup',
      pass: 'commonpwd'
    }
  }

  const beanify = new Beanify({
    nats: Object.assign({}, beanifyOpts.nats),
    log: { level: 'error' }
  })

  beanify.register(require('beanify-ajv'))

  // beanify-mail plugin
  beanify.register(require('../index'), {
    transport: {
      name: '测试邮件',
      // logger: true, // 是否开启日志
      debug: true, // 开启debug调试信息
      connectionTimeout: 36000, // 等待连接建立的毫秒数
      greetingTimeout: 16000, // 建立连接后等待问候语的毫秒数
      socketTimeout: 3600000, // 允许多少毫秒的不活动状态
      pool: true, // 开启连接池|sendmail | streamTransport | jsonTransport | SES
      maxConnections: 100, // 是针对SMTP服务器建立的最大同时连接数（默认为5）
      maxMessages: 200, // 限制使用单个连接发送的消息数（默认为100）。达到maxMessages后，将断开连接并为以下消息创建一个新的连接
      rateDelta: 2000, // 定义用于速率限制的时间测量周期（以毫秒为单位）（默认为1000，即1秒）
      host: 'smtp.qq.com',
      port: 465,
      secure: true, // 只有端口为587的时候为false，其余端口为true
      auth: {
        type: 'custom',
        method: 'MY-CUSTOM-METHOD', // 强制Nodemailer使用您的自定义处理程序
        user: '1296114084@qq.com',
        pass: 'molqnmyxstotiajb'
      },
      customAuth: {
        'MY-CUSTOM-METHOD': myCustomMethod // 自定义处理函数
      }// ,
      // tls: {
      //   // 使用自签名或无效的TLS证书打开与TLS服务器的连接
      //   rejectUnauthorized: false
      // }
      // disableFileAccess: true, //如果为true，则不允许使用文件作为内容。当您要将不可信来源的JSON数据用作电子邮件时，请使用它。如果附件或消息节点尝试从文件中获取内容，则发送将返回错误。如果在传输选项中也设置了该字段，则邮件数据中的值将被忽略
      // disableUrlAccess: true //如果为true，则不允许将Urls用作内容。如果在传输选项中也设置了该字段，则邮件数据中的值将被忽略
    }
  })

  beanify.ready(() => {
    console.log('beanify startup test successful......')
    t.tearDown(() => {
      console.log('tap.tearDown')
      beanify.close()
    })
    cb(t.test, beanify)
  })
}

module.exports = {
  build,
  listdata
}
