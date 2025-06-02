"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponsePaginate = exports.TokenRefreshResponse = exports.AccessTokenErrorResponse = exports.SuccessResponse = exports.FailureMsgResponse = exports.SuccessMsgResponse = exports.InternalErrorResponse = exports.BadRequestResponse = exports.ForbiddenResponse = exports.NotFoundResponse = exports.AuthFailureResponse = void 0;
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["SUCCESS"] = 200] = "SUCCESS";
    ResponseStatus[ResponseStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ResponseStatus[ResponseStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ResponseStatus[ResponseStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    ResponseStatus[ResponseStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    ResponseStatus[ResponseStatus["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
})(ResponseStatus || (ResponseStatus = {}));
class ApiResponse {
    constructor(statusCode, status, message) {
        this.statusCode = statusCode;
        this.status = status;
        this.message = message;
    }
    prepare(res, response) {
        return res.status(this.status).json(ApiResponse.sanitize(response));
    }
    send(res) {
        return this.prepare(res, this);
    }
    static sanitize(response) {
        const clone = {};
        Object.assign(clone, response);
        // @ts-ignore
        delete clone.status;
        for (const i in clone)
            if (typeof clone[i] === 'undefined')
                delete clone[i];
        return clone;
    }
}
class AuthFailureResponse extends ApiResponse {
    constructor(message = 'Authentication Failure') {
        super(ResponseStatus.UNAUTHORIZED, ResponseStatus.UNAUTHORIZED, message);
    }
}
exports.AuthFailureResponse = AuthFailureResponse;
class NotFoundResponse extends ApiResponse {
    constructor(message = 'Not Found') {
        super(ResponseStatus.NOT_FOUND, ResponseStatus.NOT_FOUND, message);
    }
    send(res) {
        var _a;
        this.url = (_a = res.req) === null || _a === void 0 ? void 0 : _a.originalUrl;
        return super.prepare(res, this);
    }
}
exports.NotFoundResponse = NotFoundResponse;
class ForbiddenResponse extends ApiResponse {
    constructor(message = 'Forbidden') {
        super(ResponseStatus.FORBIDDEN, ResponseStatus.FORBIDDEN, message);
    }
}
exports.ForbiddenResponse = ForbiddenResponse;
class BadRequestResponse extends ApiResponse {
    constructor(message = 'Bad Parameters') {
        super(ResponseStatus.BAD_REQUEST, ResponseStatus.BAD_REQUEST, message);
    }
}
exports.BadRequestResponse = BadRequestResponse;
class InternalErrorResponse extends ApiResponse {
    constructor(message = 'Internal Error') {
        super(ResponseStatus.INTERNAL_ERROR, ResponseStatus.INTERNAL_ERROR, message);
    }
}
exports.InternalErrorResponse = InternalErrorResponse;
class SuccessMsgResponse extends ApiResponse {
    constructor(message) {
        super(ResponseStatus.SUCCESS, ResponseStatus.SUCCESS, message);
    }
    send(res) {
        return super.prepare(res, this);
    }
}
exports.SuccessMsgResponse = SuccessMsgResponse;
class FailureMsgResponse extends ApiResponse {
    constructor(message) {
        super(ResponseStatus.SUCCESS, ResponseStatus.SUCCESS, message);
    }
}
exports.FailureMsgResponse = FailureMsgResponse;
class SuccessResponse extends ApiResponse {
    constructor(message, data) {
        super(ResponseStatus.SUCCESS, ResponseStatus.SUCCESS, message);
        this.data = data;
    }
    send(res) {
        return super.prepare(res, this);
    }
}
exports.SuccessResponse = SuccessResponse;
class AccessTokenErrorResponse extends ApiResponse {
    constructor(message = 'Access token invalid') {
        super(ResponseStatus.UNAUTHORIZED, ResponseStatus.UNAUTHORIZED, message);
        this.instruction = 'refresh_token';
    }
    send(res) {
        res.setHeader('instruction', this.instruction);
        return super.prepare(res, this);
    }
}
exports.AccessTokenErrorResponse = AccessTokenErrorResponse;
class TokenRefreshResponse extends ApiResponse {
    constructor(message, accessToken, refreshToken) {
        super(ResponseStatus.SUCCESS, ResponseStatus.SUCCESS, message);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
    send(res) {
        return super.prepare(res, this);
    }
}
exports.TokenRefreshResponse = TokenRefreshResponse;
class SuccessResponsePaginate extends ApiResponse {
    constructor(message, docs, meta) {
        super(ResponseStatus.SUCCESS, ResponseStatus.SUCCESS, message);
        this.meta = meta;
        this.docs = docs;
    }
    send(res) {
        return super.prepare(res, this);
    }
}
exports.SuccessResponsePaginate = SuccessResponsePaginate;
//# sourceMappingURL=ApiResponse.js.map