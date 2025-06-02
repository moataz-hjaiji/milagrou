"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = [
            'page',
            'sort',
            'limit',
            'fields',
            'deleted',
            'perPage',
            'search',
            'populate',
        ];
        excludedFields.forEach((el) => delete queryObj[el]);
        let checkForValidMongoDbID = new RegExp('^[0-9a-fA-F]{24}$');
        const queryStrObj = {};
        for (const key in queryObj) {
            let value = queryObj[key];
            if (Array.isArray(value)) {
                value = value.map((v) => checkForValidMongoDbID.test(v) ? new mongodb_1.ObjectId(v).toString() : v);
            }
            else if (value === 'true' || value === 'false') {
                //@ts-ignore
                value = value === 'true'; // Explicit cast to string
            }
            else if (checkForValidMongoDbID.test(value)) {
                //@ts-ignore
                value = new mongodb_1.ObjectId(value);
            }
            queryStrObj[key] = value;
        }
        if (Object.keys(queryStrObj).length) {
            const queryOption = Object.keys(queryStrObj).map((field) => {
                const value = queryStrObj[field];
                if (Array.isArray(value)) {
                    return { [field]: { $in: value } };
                }
                else if (typeof value === 'boolean') {
                    return { [field]: value };
                }
                else if (value instanceof mongodb_1.ObjectId) {
                    return { [field]: value };
                }
                else {
                    return { [field]: { $regex: value, $options: 'i' } };
                }
            });
            this.query = this.query.find({ $and: queryOption });
        }
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        var _a;
        if ((_a = this.queryString) === null || _a === void 0 ? void 0 : _a.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        return this;
    }
    populate() {
        var _a;
        if ((_a = this.queryString) === null || _a === void 0 ? void 0 : _a.populate) {
            const populateFields = this.queryString.populate.split(',');
            const populateArray = populateFields.map((field) => {
                // If no dots, handle as simple populate
                if (!field.includes('.')) {
                    const [path, select] = field.split(':');
                    return select
                        ? { path, select: select.split('|').join(' ') }
                        : { path };
                }
                // Handle nested populates
                const paths = field.split('.');
                let populateObject = {};
                // Handle first level
                const [firstPath, firstSelect] = paths[0].split(':');
                populateObject = {
                    path: firstPath,
                    ...(firstSelect && { select: firstSelect.split('|').join(' ') }),
                };
                // Process nested paths
                let current = populateObject;
                for (let i = 1; i < paths.length; i++) {
                    const isLastLevel = i === paths.length - 1;
                    if (isLastLevel && paths[i].includes('*')) {
                        // Handle multiple parallel populates at the last level
                        const parallelPopulates = paths[i].split('*').map((part) => {
                            const [path, select] = part.split(':');
                            return {
                                path,
                                ...(select && { select: select.split('|').join(' ') }),
                            };
                        });
                        current.populate = parallelPopulates;
                    }
                    else {
                        // Handle single populate
                        const [path, select] = paths[i].split(':');
                        const populateConfig = {
                            path,
                            ...(select && { select: select.split('|').join(' ') }),
                        };
                        if (!isLastLevel) {
                            populateConfig.populate = {};
                            current.populate = populateConfig;
                            current = current.populate;
                        }
                        else {
                            current.populate = populateConfig;
                        }
                    }
                }
                return populateObject;
            });
            // Apply all populate objects
            populateArray.forEach((popObj) => {
                this.query = this.query.populate(popObj);
            });
        }
        return this;
    }
    search(searchFields) {
        var _a;
        if ((_a = this.queryString) === null || _a === void 0 ? void 0 : _a.search) {
            const queryOption = searchFields.map((field) => ({
                [field]: { $regex: this.queryString.search, $options: 'i' },
            }));
            this.query = this.query.find({ $or: queryOption });
        }
        return this;
    }
    recherche(searchFields) {
        var _a;
        if ((_a = this.queryString) === null || _a === void 0 ? void 0 : _a.search) {
            let filter = [];
            const queryOption = searchFields.map((field) => filter.push({
                [field]: { $regex: this.queryString.search, $options: 'i' },
            }));
            this.query = this.query.find({ $or: filter });
        }
        return this;
    }
}
exports.default = APIFeatures;
//# sourceMappingURL=apiFeatures.js.map