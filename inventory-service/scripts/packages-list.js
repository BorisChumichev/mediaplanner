const bb = require('bluebird')
  , { flatten, compose, prop, map } = require('ramda')
  , { getNonstandardPads } = require('../models/pad')
  , { getPositionsForPad } = require('../models/position')
  , { getFormatsForPosition } = require('../models/format')
  , { getPackagesForFormat, denormalizePackage } = require('../models/package')
  , { asCSV } = require('../lib/utils')
  , { writeFileSync } = require('fs')

const collect = async (sources, extractor) =>
  flatten(
    await bb.all(
      map(compose(extractor, prop('id')), sources)
    )
  )

module.exports = async () => {
  const pads = await getNonstandardPads()
  console.log('extracted pads')
  const positions = await collect(pads, getPositionsForPad)
  console.log('extracted positions')
  const formats = await collect(positions, getFormatsForPosition)
  console.log('extracted formats')
  const packages = await collect(formats, getPackagesForFormat)
  console.log('extracted packages')
  console.log(packages)
  await writeFileSync('packages.csv', asCSV(packages.map(denormalizePackage)))
}
