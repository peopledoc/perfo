#!/usr/bin/env node

let setupServer = require('./index')

let app = require('express')()
setupServer(app)
app.listen(Number(process.env.PERFO_PORT) || 4200)
