const api = require('../lib/api')
  , { prop } = require('ramda')

const getPackagesForFormat = async id =>
  prop('items', await api.getPackagesForFormat(id))

const denormalizePackage = p => (
    { format_name: p.format.name
    , format_id: p.format.id
    , name: p.name
    , price: p.price
    , price_unit: p.price_type.unit
    , id: p.id
    , position_name: p.position.name
    , position_id: p.position.id
    , pad_name: p.pad.name
    , pad_id: p.pad.id
    , slot_id: p.slot_id
    , format_type: p.format_type
    }
  )

module.exports =
  { getPackagesForFormat
  , denormalizePackage
  }
