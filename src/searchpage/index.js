const redis = require('./redis')
redis.importData()
const elastic = require('./elastic')
elastic.importData()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.set('port', process.env.PORT || 3001)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.get('/search', (req, res) => {
  let body = {
    query: {
      match: {
        name: req.query.item
      }
    }
  }

  elastic.search(body)
    .then(results => {
      console.log(`found ${results.hits.total.value} items in ${results.took}ms`);
      res.send(results.hits.hits)
    })
    .catch(err => {
      console.log(err)
      res.send([])
    })
})

app.get('/item/:itemIndexId/review', (req, res) => {
  redis.search(`${req.params.itemIndexId}`)
    .then(results => {
      res.send(results)
    })
    .catch(err => {
      console.log('Error fetching review from Redis')
      res.send([])
    })
})

app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'))
})