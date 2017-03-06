const packageModel = require('./models/package')
  , updateAdminData = require('./scripts/update-admin-data')
  , updateInventory = require('./scripts/update-inventory')

setInterval(updateAdminData, 3e4) //update every 30 seconds
setInterval(updateInventory, 36e5) //update every hour

module.exports = async function (req, res) {
  const packages = await packageModel.findAll()
  return (
    { packages: packages
    , status:
      { packagesCount: packages.length
      }
    }
  )
}
