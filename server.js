'use strict'

const beanifyPlugin = require('beanify-plugin')

function send (transporter, data) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}

function verify (transporter) {
  return new Promise((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err && !success) {
        reject(err)
      } else {
        resolve(success)
      }
    })
  })
}

module.exports = beanifyPlugin((beanify, opts, done) => {
  const transporter = beanify.mail
  beanify.route({
    url: 'mail.send',
    schema: {
      ...require('./schema.json')
    }
  }, ({ body }, cb) => {
    verify(transporter).then(
      (success) => {
        send(transporter, body).then(
          (success) => {
            cb(null, success)
          }, (err) => {
            cb(err)
          }
        )
      }, (err) => {
        cb(err)
      }
    )
  })
  done()
}, {
  beanify: '>=1.1.9',
  name: 'server',
  options: {
  }
})
