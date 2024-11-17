const multer = require('multer');
const fs = require('fs');

// Temporary array to hold data if DB is not present
let temporaryArray = [];

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Correct CSV headers
const expectedHeaders = [
  "Campaign ID",
  "Campaign Name",
  "Ad Group ID",
  "FSN ID",
  "Product Name",
  "Ad Spend",
  "Views",
  "Clicks",
  "Direct Units",
  "Indirect Units",
  "Direct Revenue",
  "Indirect Revenue"
];

// Upload CSV and insert data into the database or temporary array
const uploadCSV = (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');

  const filePath = file.path;

  // Read the uploaded CSV file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      fs.unlinkSync(filePath); // Clean up the uploaded file
      return res.status(500).send('Error reading file');
    }

    const rows = data.split('\n').map(row => row.trim());
    const headers = rows[0].split(',').map(header => header.trim()); // Extract headers

    // Validate headers
    if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
      fs.unlinkSync(filePath); // Delete invalid file
      return res.status(400).json({
        message: 'CSV headers do not match expected format',
        code: 400,
        expectedHeaders
      });
    }

    const csvData = [];
    rows.slice(1).forEach((row) => { // Skip the header row
      if (!row) return; // Skip empty rows
      const values = row.split(',');

      const rowData = {
        campaignID: values[0],
        campaignName: values[1],
        adGroupID: values[2],
        fsnID: values[3],
        productName: values[4],
        adSpend: parseFloat(values[5]) || null,
        views: parseInt(values[6]) || 0,
        clicks: parseInt(values[7]) || 0,
        directUnits: parseInt(values[8]) || 0,
        indirectUnits: parseInt(values[9]) || 0,
        directRevenue: parseFloat(values[10]) || null,
        indirectRevenue: parseFloat(values[11]) || null,
      };

      // Add calculated fields
      rowData.ctrPercent = rowData.views > 0 ? (rowData.clicks / rowData.views) * 100 : 0;
      rowData.totalRevenue = (rowData.directRevenue || 0) + (rowData.indirectRevenue || 0);
      rowData.totalOrders = (rowData.directUnits || 0) + (rowData.indirectUnits || 0);
      rowData.roas = rowData.adSpend > 0 ? rowData.totalRevenue / rowData.adSpend : 0;

      // Check for DB presence
      if (typeof db === 'undefined' || !db) {
        // If no DB, push the data into the temporary array
        temporaryArray.push(rowData);
      } else {
        // If the database is available, insert into the database
        const query = `
          INSERT INTO products (campaignID, campaignName, adGroupID, fsnID, productName, adSpend, views, clicks, directUnits, indirectUnits, directRevenue, indirectRevenue, ctrPercent, totalRevenue, totalOrders, roas)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(query, Object.values(rowData), (err) => {
          if (err) {
            console.error('Error inserting data into database:', err.message);
          }
        });
      }

      csvData.push(rowData); // Add the row to the csvData array
    });

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    // Send back the response with CSV data
    res.status(200).json({
      message: 'CSV file uploaded and data processed successfully',
      code: 200,
      data: csvData, // Send processed data in the response
    });
  });
};

const paginateData = (data, page, limit) => {
  const totalRecords = data.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages)); // Ensure valid page number
  const startIndex = (currentPage - 1) * limit;
  const paginatedData = data.slice(startIndex, startIndex + limit);

  return { paginatedData, totalRecords, totalPages, currentPage };
};

const filterData = (data, filters) => {
  return data.filter(item => {
    return Object.keys(filters).every(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        return item[key] && item[key].toString().toLowerCase() === filters[key].toString().toLowerCase();
      }
      return true; // No filter for this key
    });
  });
};

const generatePaginatedResponse = (filteredData, page, limit) => {
  const { paginatedData, totalRecords, totalPages, currentPage } = paginateData(filteredData, page, limit);

  return {
    message: 'Data retrieved successfully',
    code: 200,
    data: paginatedData,
    meta: {
      totalRecords,
      totalPages,
      currentPage,
      limit,
    },
  };
};

const reportByCampaign = (req, res) => {
  const { campaignName, adGroupID, fsnID, productName, page = 1, limit = 10 } = req.query;
  const filters = { campaignName, adGroupID, fsnID, productName };

  const data = typeof db === 'undefined' || !db ? temporaryArray : [];
  const filteredData = filterData(data, filters);

  const response = generatePaginatedResponse(filteredData, parseInt(page, 10), parseInt(limit, 10));
  res.status(200).json(response);
};

const reportByAdGroupID = (req, res) => {
  const { campaignName, adGroupID, fsnID, productName, page = 1, limit = 10 } = req.query;
  const filters = { campaignName, adGroupID, fsnID, productName };

  const data = typeof db === 'undefined' || !db ? temporaryArray : [];
  const filteredData = filterData(data, filters);

  const response = generatePaginatedResponse(filteredData, parseInt(page, 10), parseInt(limit, 10));
  res.status(200).json(response);
};

const reportByFSNID = (req, res) => {
  const { campaignName, adGroupID, fsnID, productName, page = 1, limit = 10 } = req.query;
  const filters = { campaignName, adGroupID, fsnID, productName };

  const data = typeof db === 'undefined' || !db ? temporaryArray : [];
  const filteredData = filterData(data, filters);

  const response = generatePaginatedResponse(filteredData, parseInt(page, 10), parseInt(limit, 10));
  res.status(200).json(response);
};

const reportByProductName = (req, res) => {
  const { campaignName, adGroupID, fsnID, productName, page = 1, limit = 10 } = req.query;
  const filters = { campaignName, adGroupID, fsnID, productName };

  const data = typeof db === 'undefined' || !db ? temporaryArray : [];
  const filteredData = filterData(data, filters);

  const response = generatePaginatedResponse(filteredData, parseInt(page, 10), parseInt(limit, 10));
  res.status(200).json(response);
};

module.exports = {
  upload,
  uploadCSV,
  reportByCampaign,
  reportByAdGroupID,
  reportByFSNID,
  reportByProductName,
};

