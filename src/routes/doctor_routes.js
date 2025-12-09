const express = require('express');
const router = express.Router();

//router paths here
router.get('/', (req, res) => {
    //this default is for login maybe?
});

router.get('/display', (req, res) => {
    //route to display all needed to be displayed
    //gets info from other routes (e.g. /patient-list, /prescrption-list)
});

router.get('/patient-list', (req, res) => {
    //gets patient-list from the db
});

router.get('/prescription-list', (res, req) => {
    //gets prescription-list from the db
});

//others later


module.exports = router;