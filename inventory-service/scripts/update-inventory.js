const packageModel = require('../models/package')

packageModel.myTargetAPI
  .sync()
  .then(res => console.log(res))
  .catch(err => console.log(err))
