'use strict'

const ROOT_DIR = './'
const Sonus = require('sonus')
var request = require('request')
const speech = require('@google-cloud/speech')({
  projectId: 'streaming-speech-sample',
  keyFilename: ROOT_DIR + 'keyfile.json'
})

var options = {
    url: 'https://hashtag-api.herokuapp.com/',
    method: 'POST'
}

const hotwords = [{ file: ROOT_DIR + 'resources/lumos.pmdl', hotword: 'lumos' },
                  { file: ROOT_DIR + 'resources/wingardium.pmdl', hotword: 'wingardium leviosa' }]
const language = "en-US"

//recordProgram can also be 'arecord' which works much better on the Pi and low power devices
const sonus = Sonus.init({ hotwords, language, recordProgram: "rec" }, speech)

Sonus.start(sonus)
console.log('Say lumos or wingardium leviosa!...')

sonus.on('hotword', (index, keyword) => {
  console.log('💡')
  const endpoint = keyword === 'wingardium leviosa' ? 'wingardium' : keyword
  options.url += endpoint
  // Start the request
  request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          console.log('Sent notification')
      }
  })
})

sonus.on('partial-result', result => console.log("Partial", result))

sonus.on('error', error => console.log('error', error))

sonus.on('final-result', result => {
  console.log("Final", result)
  if (result.includes("stop")) {
    Sonus.stop()
  }
})
