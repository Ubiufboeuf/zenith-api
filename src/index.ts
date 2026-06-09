import express from 'express'

const PORT = 1234
const app = express()

app.get('/', (req, res) => {
  res.send('a')
})

app.listen(PORT, () => console.log(`Servidor levantado en el puerto :${PORT}`))
