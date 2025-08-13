"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicController_1 = require("../controllers/publicController");
const router = (0, express_1.Router)();
router.get('/leaderboard', publicController_1.publicLeaderboard);
router.post('/contact', publicController_1.contact);
exports.default = router;
