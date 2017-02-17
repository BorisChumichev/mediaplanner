const api = require('../lib/api')
  , { prop } = require('ramda')

const getPositionsForPad = async id =>
  prop('items', await api.getPositionsForPad(id))

module.exports =
  { getPositionsForPad
  }
