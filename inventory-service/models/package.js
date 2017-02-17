const api = require('../lib/api')
  , { prop } = require('ramda')

const getPackagesForFormat = async id =>
  prop('items', await api.getPackagesForFormat(id))

module.exports =
  { getPackagesForFormat
  }
