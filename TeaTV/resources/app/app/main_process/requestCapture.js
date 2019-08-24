const { session } = require('electron')
const EventRegister = require('js-events-listener')
// Modify the user agent for all requests to the following urls.
const filter = {
  urls: ['https://9xbuddy.com/action/extract']
}

let afterRequestUrl = []

session.defaultSession.webRequest.onCompleted(filter, (details, callback) => {
  EventRegister.emit('9X_BUDDY')
})

EventRegister.on('CAPTURE_REQUEST', arg => {
  console.log('CAPTURE_REQUEST', arg)
  if (afterRequestUrl.indexOf(arg.afterRequest) !== -1) return
  afterRequestUrl.push(arg.afterRequest)
  let filterUrl = {
    urls: [arg.afterRequest]
  }
  session.defaultSession.webRequest.onCompleted(
    filterUrl,
    (details, callback) => {
      EventRegister.emit('CAPTURE_REQUEST', arg)
    }
  )
})
