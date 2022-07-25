const express = require('express')
const router = express.Router()
const Extra = require('../../controllers/Extra/extraController')
const catchAsync = require('../../Utilities/catchAsync')

router.patch('/age/:uid', catchAsync(Extra.validateUserAge))

router.get('/random/query', catchAsync(Extra.retrieveRandomInstituteQuery))


module.exports = router