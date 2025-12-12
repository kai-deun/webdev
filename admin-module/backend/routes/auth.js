const express = require('express');
const authControl = require('../controllers/authCon');

const route_point = express.Router();

route_point.post('login', authControl.login);
route_point.post('logout', authControl.logout);

module.exports = route_point;