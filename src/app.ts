import express, { Request, Response, NextFunction } from 'express';
import swaggerUI from 'swagger-ui-express';
import Logger from './core/Logger';
import cors from 'cors';
import { corsUrl, environment } from './configVars';
import './database'; // initialize database
import { NotFoundError, ApiError, InternalError } from './core/ApiError';
import routesV1 from './routes';
import { specs } from './docs';

process.on('uncaughtException', (e) => {
  // Logger.error(e);
  console.log(e);
});

const app = express();

// API Request/Response Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log incoming request
  console.log(`[${timestamp}] --> ${req.method} ${req.originalUrl}`);
  console.log(`    Headers: ${JSON.stringify(req.headers, null, 2)}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`    Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`    Query: ${JSON.stringify(req.query, null, 2)}`);
  }

  // Override res.end to capture response
  const originalEnd = res.end;
  const originalSend = res.send;
  const originalJson = res.json;
  
  let responseBody: any = null;

  // Capture response body from res.send
  res.send = function(body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Capture response body from res.json
  res.json = function(body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Override res.end to log response details
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const endTimestamp = new Date().toISOString();
    
    // Determine status color for console
    const statusCode = res.statusCode;
    let statusColor = '';
    if (statusCode >= 200 && statusCode < 300) {
      statusColor = '\x1b[32m'; // Green for success
    } else if (statusCode >= 300 && statusCode < 400) {
      statusColor = '\x1b[33m'; // Yellow for redirect
    } else if (statusCode >= 400 && statusCode < 500) {
      statusColor = '\x1b[31m'; // Red for client error
    } else if (statusCode >= 500) {
      statusColor = '\x1b[35m'; // Magenta for server error
    }
    const resetColor = '\x1b[0m';

    // Log response details
    console.log(`[${endTimestamp}] <-- ${req.method} ${req.originalUrl}`);
    console.log(`    Status: ${statusColor}${statusCode}${resetColor}`);
    console.log(`    Response Time: ${responseTime}ms`);
    
    console.log(`    --------------------------------`);
    
    return originalEnd.call(this, chunk, encoding);
  };

  next();
});

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(
  cors({ origin: corsUrl, optionsSuccessStatus: 200, credentials: true })
);

if (environment === 'development') {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
}

// Routes
app.use('/api', routesV1);
app.use(express.static('media'));
app.use('/public', express.static('public'));

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
  } else {
    if (environment === 'development') {
      // Logger.error(err);
      console.log(err.message);
      return res.status(500).send({ status: 'fail', message: err.message });
    }
    ApiError.handle(new InternalError(), res);
  }
});

export default app;
