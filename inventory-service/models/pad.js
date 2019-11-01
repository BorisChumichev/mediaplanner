const api = require('../lib/api'),
  { filter, prop } = require('ramda')

const isNonstandard = pad =>
  new RegExp(/2019(\ )?НН/).test(pad.name) &&
  !new RegExp(/(Curious|Юла|Maps|Пакеты|Аптеки|Вконтакте|Pets)/).test(pad.name)

const filterNonstandard = pads => filter(isNonstandard, prop('items', pads))

const getNonstandardPads = async () => filterNonstandard(await api.getPads())

module.exports = { getNonstandardPads }
