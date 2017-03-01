const { keys, values, join, compose, map, replace } = require('ramda')

const asCSV = arr =>
  join(',', keys(arr[0])) + '\n' + join('\n', map(compose(join(','), map(replace(/\,/g, '')), map(v => v.toString()), values), arr))

module.exports = {
  asCSV
}
