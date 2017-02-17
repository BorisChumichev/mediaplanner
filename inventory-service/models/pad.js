const api = require('../lib/api')
  , { filter, propEq, prop } = require('ramda')

const isNonstandard = pad =>
  (new RegExp(/2017(\ )?НН/)).test(pad.name)

const filterNonstandard = pads =>
  filter(isNonstandard, prop('items', pads))

const getNonstandardPads = async () =>
  filterNonstandard(await api.getPads())

module.exports = { getNonstandardPads }
