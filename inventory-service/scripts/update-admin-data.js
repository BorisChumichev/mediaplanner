const packageModel = require('../models/package')

module.exports = () =>
  packageModel.googleAPI
    .sync()
    .then(res => console.log(res))
    .catch(err => console.log(err))
