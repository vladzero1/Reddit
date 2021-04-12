"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordLength = exports.validateUsernameLength = void 0;
function validateUsernameLength(username) {
    if (username.length <= 2) {
        return [{
                field: "username",
                message: "length must be greater than 2!",
            }];
    }
    return null;
}
exports.validateUsernameLength = validateUsernameLength;
function validatePasswordLength(password, field) {
    if (password.length <= 3) {
        return [{
                field: field,
                message: "length must be greater than 3!"
            }];
    }
    return null;
}
exports.validatePasswordLength = validatePasswordLength;
//# sourceMappingURL=validation.js.map