#!/usr/bin/env node

let express = require('express')
let app = express()

require('./circleci-proxy')(app)

app.listen(Number(process.env.PERFO_PORT) || 4200)
