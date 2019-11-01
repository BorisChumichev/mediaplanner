const api = require('../lib/api'),
  { prop, filter } = require('ramda')

const isUsable = format =>
  !new RegExp(/(Спецпроект|Закладка|Виджет)/i).test(format.name)

const filterUsable = formats => filter(isUsable, formats)

const getFormatsForPosition = async id =>
  filterUsable(prop('items', await api.getFormatsForPosition(id)))

module.exports = { getFormatsForPosition }
