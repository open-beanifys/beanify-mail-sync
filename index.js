'use strict'

const beanifyPlugin = require('beanify-plugin')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')

module.exports = beanifyPlugin((beanify, options, done) => {
  const defaultoptions = {
    transport: {
      host: '127.0.0.1',
      port: 25,
      secure: true
    }
  }
  options = !options.transport ? defaultoptions : options

  try {
    const transporter = nodemailer.createTransport(smtpTransport(options.transport))
    beanify.decorate('mail', transporter)
    beanify.register(require('./server'))
  } catch (err) {
    beanify.log.fatal(err)
  }

  done()
}, {
  beanify: '>=1.1.9',
  name: require('./package.json').name,
  options: {
    transport: {
      jsonTransport: true
    }
  }
})
