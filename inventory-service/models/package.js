const bb = require('bluebird'),
  api = require('../lib/api'),
  { flatten, compose, prop, map, path } = require('ramda'),
  { getNonstandardPads } = require('../models/pad'),
  { getPositionsForPad } = require('../models/position'),
  { getFormatsForPosition } = require('../models/format'),
  { STRING, INTEGER, DOUBLE, BIGINT } = require('sequelize'),
  db = require('../../common/lib/db'),
  {
    getAdminDataFromSheet,
    inputDataToSheet
  } = require('../../admin-panel/google-api/admin-panel')

db.define('package2019', {
  myTargetId: { type: INTEGER, unique: true },
  padId: { type: INTEGER },
  padName: { type: STRING },
  positionId: { type: INTEGER },
  positionName: { type: STRING },
  formatId: { type: INTEGER },
  formatName: { type: STRING },
  formatType: { type: STRING },
  priceType: { type: STRING },
  status: { type: STRING },
  price: { type: DOUBLE },
  slotId: { type: INTEGER },
  ctr: { type: DOUBLE },
  preview: {
    type: STRING,
    defaultValue: 'https://media.giphy.com/media/TlK63EQwHQC4zauPPTq/giphy.gif'
  },
  impressionsLimit: { type: BIGINT, allowNull: true },
  impressionsPrediction: { type: BIGINT, allowNull: true },
  coveragePrediction: { type: BIGINT, allowNull: true }
}).sync()

const packageModel = db.models.package2019

packageModel.getPackagesForFormat = async id =>
  prop('items', await api.getPackagesForFormat(id))

packageModel.myTargetAPI = {
  _fieldsMapping: {
    myTargetId: prop('id'),
    padId: path(['pad', 'id']),
    padName: path(['pad', 'name']),
    positionId: path(['position', 'id']),
    positionName: path(['position', 'name']),
    formatId: path(['format', 'id']),
    formatName: path(['format', 'name']),
    formatType: prop('format_type'),
    priceType: path(['price_type', 'unit']),
    price: compose(
      parseInt,
      prop('price')
    ),
    slotId: prop('slot_id'),
    status: prop('status')
  },

  getPackagesList: async () => {
    const collect = async (sources, extractor) =>
      flatten(
        await bb.all(
          map(
            compose(
              extractor,
              prop('id')
            ),
            sources
          )
        )
      )

    const pads = await getNonstandardPads(),
      positions = await collect(pads, getPositionsForPad),
      formats = await collect(positions, getFormatsForPosition),
      packages = await collect(formats, packageModel.getPackagesForFormat)
    console.log(packages)
    return packages
  },

  normalizePackages: map(p =>
    map(resolver => resolver(p), packageModel.myTargetAPI._fieldsMapping)
  ),

  persistPackages: async packages => {
    const normalizedPackages = packageModel.myTargetAPI.normalizePackages(
      packages
    )

    await bb.resolve(normalizedPackages).map(p => {
      if (p.price > 1)
        return packageModel.upsert(p, {
          where: { myTargetId: p.myTargetId }
        })
      else return null
    })
  },
  sync: async () =>
    await packageModel.myTargetAPI.persistPackages(
      await packageModel.myTargetAPI.getPackagesList()
    )
}

packageModel.googleAPI = {
  sync: async () => {
    const adminData = await getAdminDataFromSheet()
    await bb
      .resolve(adminData)
      .map(p =>
        packageModel.update(p, { where: { myTargetId: p.myTargetId } })
      )
    await inputDataToSheet(
      await packageModel.findAll({ where: { status: 'active' } })
    )
  }
}

module.exports = packageModel
