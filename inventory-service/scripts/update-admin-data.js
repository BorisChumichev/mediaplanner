const packageModel = require('../models/package')

packageModel.googleAPI
  .sync()
  .then(res => console.log(res))
  .catch(err => console.log(err))
