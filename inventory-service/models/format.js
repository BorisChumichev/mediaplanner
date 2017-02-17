const api = require('../lib/api')
  , { prop } = require('ramda')

const getFormatsForPosition = async id =>
  prop('items', await api.getFormatsForPosition(id))

module.exports =
  { getFormatsForPosition
  }
