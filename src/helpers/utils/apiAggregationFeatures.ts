import { ObjectId } from 'mongodb';

class AggregationFeatures {
  pipeline: any[];

  constructor(pipeline: any[]) {
    this.pipeline = pipeline;
  }

  addPipelineStage(stage: any) {
    this.pipeline.push(stage);
    return this; // Return the instance for method chaining
  }

  filter(queryString: any) {
    const queryObj: Record<string, string | string[]> = { ...queryString };
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'deleted',
      'perPage',
      'search',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    let checkForValidMongoDbID = new RegExp('^[0-9a-fA-F]{24}$');

    const queryStrObj: Record<string, any> = {};
    for (const key in queryObj) {
      let value: any = queryObj[key];

      if (Array.isArray(value)) {
        value = value.map((v) =>
          ObjectId.isValid(v) ? new ObjectId(v).toString() : v
        );
      } else if (value === 'true' || value === 'false') {
        value = value === 'true';
      } else if (checkForValidMongoDbID.test(value)) {
        value = new ObjectId(value);
      }
      queryStrObj[key] = value;
    }

    if (Object.keys(queryStrObj).length) {
      const matchStage = Object.keys(queryStrObj).map((field: string) => {
        const value = queryStrObj[field];
        if (Array.isArray(value)) {
          return { [field]: { $in: value } };
        } else if (typeof value === 'boolean' || value instanceof ObjectId) {
          return { [field]: value };
        } else {
          return { [field]: { $regex: value, $options: 'i' } };
        }
      });

      this.pipeline.push({ $match: { $and: matchStage } });
    }
    return this;
  }

  sort(queryString: any) {
    if (queryString.sort) {
      const sortBy = queryString.sort.split(',').join(' ');
      if (sortBy[0] === '-') {
        this.pipeline.push({ $sort: { [sortBy.substring(1)]: -1 } });
      } else {
        this.pipeline.push({ $sort: { [sortBy]: 1 } });
      }
    } else {
      this.pipeline.push({ $sort: { createdAt: -1 } });
    }
    return this;
  }

  limitFields(queryString: any) {
    if (queryString.fields) {
      const fields = queryString.fields.split(',').join(' ');
      this.pipeline.push({ $project: { [fields]: 1 } });
    } else {
      this.pipeline.push({ $project: { __v: 0 } });
    }

    return this;
  }

  search(queryString: any, searchFields: string[]) {
    if (queryString?.search) {
      const queryOption = searchFields.map((field: string) => ({
        [field]: { $regex: queryString.search, $options: 'i' },
      }));

      this.pipeline.push({ $match: { $or: queryOption } });
    }

    return this;
  }
}

export default AggregationFeatures;
