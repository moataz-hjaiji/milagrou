import { ObjectId } from 'mongodb';
import { escapeRegExp } from 'lodash';

class APIFeatures {
  query: any;
  queryString: any;
  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj: Record<string, string | string[]> = { ...this.queryString };
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

    const queryStrObj: Record<string, any> = {};

    // Handle date filtering
    if (queryObj.dateField && queryObj.startDate && queryObj.endDate) {
      const dateField = queryObj.dateField as string;
      const startDate = new Date(queryObj.startDate as string);
      const endDate = new Date(queryObj.endDate as string);

      queryStrObj[dateField] = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const excludedDateFields = ['startDate', 'endDate', 'dateField'];

    excludedDateFields.forEach((el) => delete queryObj[el]);

    for (const key in queryObj) {
      let value = queryObj[key];

      if (Array.isArray(value)) {
        value = value.map((v) =>
          checkForValidMongoDbID.test(v) ? new ObjectId(v).toString() : v
        );
      } else if (value === 'true' || value === 'false') {
        //@ts-ignore
        value = value === ('true' as string);
      } else if (checkForValidMongoDbID.test(value)) {
        //@ts-ignore
        value = new ObjectId(value);
      }
      queryStrObj[key] = value;
    }

    if (Object.keys(queryStrObj).length) {
      const queryOption = Object.keys(queryStrObj).map((field: string) => {
        const value = queryStrObj[field];

        if (Array.isArray(value)) {
          return { [field]: { $in: value } };
        } else if (typeof value === 'boolean') {
          return { [field]: value };
        } else if (value instanceof ObjectId) {
          return { [field]: value };
        } else if (typeof value === 'object' && value.$gte && value.$lte) {
          return { [field]: value };
        } else {
          return { [field]: { $regex: escapeRegExp(value), $options: 'i' } };
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
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString?.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  populate() {
    if (this.queryString?.populate) {
      const populateFields = this.queryString.populate.split(',');

      const populateArray = populateFields.map((field: string) => {
        // If no dots, handle as simple populate
        if (!field.includes('.')) {
          const [path, select] = field.split(':');
          return select
            ? { path, select: select.split('|').join(' ') }
            : { path };
        }

        // Handle nested populates
        const paths = field.split('.');
        paths.forEach((element, index, arr) => {
          arr[index] = element.replace(/_/g, '.');
        });

        let populateObject: any = {};

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
          } else {
            // Handle single populate
            const [path, select] = paths[i].split(':');
            const populateConfig: any = {
              path,
              ...(select && { select: select.split('|').join(' ') }),
            };

            if (!isLastLevel) {
              populateConfig.populate = {};
              current.populate = populateConfig;
              current = current.populate;
            } else {
              current.populate = populateConfig;
            }
          }
        }
        return populateObject;
      });

      // Apply all populate objects
      populateArray.forEach((popObj: any) => {
        this.query = this.query.populate(popObj);
      });
    }
    return this;
  }

  search(searchFields: any) {
    if (this.queryString?.search) {
      const queryOption = searchFields.map((field: any) => ({
        [field]: { $regex: this.queryString.search, $options: 'i' },
      }));
      this.query = this.query.find({ $or: queryOption });
    }
    return this;
  }

  recherche(searchFields: any) {
    if (this.queryString?.search) {
      let filter: any[] = [];
      const queryOption = searchFields.map((field: any) =>
        filter.push({
          [field]: { $regex: this.queryString.search, $options: 'i' },
        })
      );
      this.query = this.query.find({ $or: filter });
    }
    return this;
  }
}

export default APIFeatures;
