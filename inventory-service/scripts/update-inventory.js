const packageModel = require('../models/package')

module.exports = () =>
  packageModel.myTargetAPI
    .sync()
    .then(res => console.log(res))
    .catch(err => console.log(err))
