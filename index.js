
const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')




// midlware
app.use(cors())


app.get('/', (req, res) => {
  res.send('Language Server is Running!')
})

app.listen(port, () => {
  console.log(`language server on port ${port}`)
})