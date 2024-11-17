const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./app'); // Assuming your Express app is in app.js
const multer = require('multer');
const { uploadCSV } = require('../src/controllers/productController'); // Adjust according to your file structure

// Mock the fs and database interactions
jest.mock('fs');
// jest.mock('../'); // If you have any database module, mock it here

describe('POST /upload-csv', () => {
  let mockFile;

  beforeEach(() => {
    // Mock a file object that Multer would create
    mockFile = {
      path: path.join(__dirname, 'mockFile.csv'),
      originalname: 'test.csv',
      mimetype: 'text/csv',
    };

    // Mock fs.readFile to simulate reading a CSV file
    fs.readFile.mockImplementation((filePath, encoding, callback) => {
      if (filePath === mockFile.path) {
        callback(null, 'Campaign ID,Campaign Name,Ad Group ID,FSN ID,Product Name,Ad Spend,Views,Clicks,Direct Units,Indirect Units,Direct Revenue,Indirect Revenue\n1,Campaign 1,AdGroup 1,FSN1,Product 1,100,200,50,10,5,200,150');
      } else {
        callback(new Error('File not found'));
      }
    });

    // Mock fs.unlinkSync to avoid actual file deletion
    fs.unlinkSync.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no file is uploaded', async () => {
    const res = await request(app)
      .post('/upload-csv')
      .expect(400);

    expect(res.body.message).toBe('No file uploaded');
  });

  it('should return 400 if CSV headers do not match expected format', async () => {
    fs.readFile.mockImplementationOnce((filePath, encoding, callback) => {
      callback(null, 'Wrong Header,Wrong Header');
    });

    const res = await request(app)
      .post('/upload-csv')
      .attach('file', mockFile.path)
      .expect(400);

    expect(res.body.message).toBe('CSV headers do not match expected format');
  });

  it('should process CSV correctly and return 200 with data', async () => {
    const res = await request(app)
      .post('/upload-csv')
      .attach('file', mockFile.path)
      .expect(200);

    expect(res.body.message).toBe('CSV file uploaded and data processed successfully');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toHaveProperty('campaignID', '1');
    expect(res.body.data[0]).toHaveProperty('campaignName', 'Campaign 1');
    expect(res.body.data[0]).toHaveProperty('adSpend', 100);
  });

  it('should handle errors when reading file', async () => {
    fs.readFile.mockImplementationOnce((filePath, encoding, callback) => {
      callback(new Error('Error reading file'));
    });

    const res = await request(app)
      .post('/upload-csv')
      .attach('file', mockFile.path)
      .expect(500);

    expect(res.body.message).toBe('Error reading file');
  });
});
