const express = require("express");
const userControl = require("../controllers/userCon");
const authMidware = require("../middleware/auth");

const route_point = express.Router();

// requires routes a authentication
route_point.use(authMidware);

route_point.get("/", userControl.getAllUsers);
route_point.get("/roles", userControl.getAllRoles);
route_point.get("/:id", userControl.getUserId);
route_point.post("/", userControl.createUser);
route_point.put("/:id", userControl.updateUser);
route_point.delete("/:id", userControl.deleteUser);

module.exports = route_point;
