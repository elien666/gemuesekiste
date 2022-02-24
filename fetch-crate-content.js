const axios = require('axios')
const Jsdom = require('jsdom').JSDOM
const Buffer = require('buffer').Buffer

Date.prototype.getWeekNumber = function(){
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
}

const urlPattern = 'https://abo.sannmann.com/index.php5?l1=meinabo&l2=wocheninhalt&usrAbokiste={size}&usrJahr={year}&usrKalenderwoche={week}'
const date = new Date()
const currentYear = date.getFullYear()
const currentWeek = date.getWeekNumber()
const crateSizes = [ 'klein', 'mittel', 'gross' ]
const crates = {}
const promises = []

module.exports = () => new Promise((resolve, reject) => {
  crateSizes.forEach((size) => {
    const url = urlPattern
      .replace('{year}', currentYear.toString())
      .replace('{week}', currentWeek.toString())
      .replace('{size}', size)

    const promise = axios.get(url, { responseType: 'arraybuffer' })
    promises.push(promise)
    promise.then(res => {
      const dom = new Jsdom(Buffer.from(res.data, 'binary').toString('latin1'))
      const content = dom.window.document.getElementById('content')
      const enumerations = content.getElementsByClassName('aufzaehlung04')
      Array.prototype.forEach.call(enumerations, (crate, index) => {
        const crateTitle = crate.getElementsByTagName('p').item(0).innerHTML
        const crateContent = crate.getElementsByTagName('li')
        const contentAsArray = Array.prototype.map.call(crateContent, (li) => li.textContent.trim())
        crates[crateTitle] = `${contentAsArray.slice(0, contentAsArray.length-2).join(', ')} und ${contentAsArray[contentAsArray.length-1]}`
      })

    })
  })

  Promise.allSettled(promises).then(() => {
    resolve(crates)
  })
})