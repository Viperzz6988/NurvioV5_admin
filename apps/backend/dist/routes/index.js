"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRoutes = exports.adminRoutes = exports.authRoutes = void 0;
var authRoutes_1 = require("./authRoutes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(authRoutes_1).default; } });
var adminRoutes_1 = require("./adminRoutes");
Object.defineProperty(exports, "adminRoutes", { enumerable: true, get: function () { return __importDefault(adminRoutes_1).default; } });
var publicRoutes_1 = require("./publicRoutes");
Object.defineProperty(exports, "publicRoutes", { enumerable: true, get: function () { return __importDefault(publicRoutes_1).default; } });
