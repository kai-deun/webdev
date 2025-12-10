const express = require('express');
const router = express.Router();

//TODO: Routes that all modules can be used (i.e. user details from db and others)

router.get('/', (req, res) => {
    //this default is for login maybe?
});

router.get('/display-patient', (req, res) => {
    //route to display all needed to be displayed
    //gets info from other routes (e.g. /patient-list, /prescrption-list)
});

router.get('/display-prescription', (req, res) => {
    //route to display all needed to be displayed
    //gets info from other routes (e.g. /patient-list, /prescrption-list)
});

module.exports = router;