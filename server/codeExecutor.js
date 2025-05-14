// server/codeExecutor.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeCode(code, callback) {
  const tempFilePath = path.join(__dirname, 'tempCode.js');

  // Write the code to a temporary file
  fs.writeFile(tempFilePath, code, (err) => {
    if (err) return callback(err, null);

    // Execute the temporary file
    exec(`node ${tempFilePath}`, (error, stdout, stderr) => {
      // Delete the temporary file after execution
      fs.unlink(tempFilePath, () => {
        if (error) return callback(stderr, null);
        return callback(null, stdout);
      });
    });
  });
}

module.exports = executeCode;
