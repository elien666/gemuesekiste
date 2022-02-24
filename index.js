const fetch = require('./fetch-crate-content')

const myCrate = 'Regionalkiste klein'

const run = async () => {
  const crates = await fetch()
  console.log(`Die ${myCrate} beinhaltet diese Woche ${crates[myCrate]}`)
}

run()
