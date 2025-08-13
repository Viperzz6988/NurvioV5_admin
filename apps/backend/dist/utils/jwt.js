"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signAccessToken(payload) {
    const secret = env_1.env.jwt.accessSecret;
    const options = { expiresIn: env_1.env.jwt.accessExpiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
function signRefreshToken(payload) {
    const secret = env_1.env.jwt.refreshSecret;
    const options = { expiresIn: env_1.env.jwt.refreshExpiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.jwt.accessSecret);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.jwt.refreshSecret);
}
