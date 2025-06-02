"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preFindHook = void 0;
function preFindHook(schema) {
    schema.pre(/^find/, function (next) {
        this.find({ deletedAt: null });
        next();
    });
}
exports.preFindHook = preFindHook;
//# sourceMappingURL=databaseHooks.js.map