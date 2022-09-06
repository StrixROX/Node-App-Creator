const express = require('express');
const body_parser = require('body-parser');
const rf = require('./router_functions');
const router = express.Router();

router.post('/generate', body_parser.json(), (req, res) =>  rf.generate(req, res));
router.get('/download', (req, res) => rf.download(req, res));

module.exports = router;