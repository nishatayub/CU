const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_BUCKET_NAME;

async function uploadFile(roomId, fileName, content) {
  const key = `${roomId}/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: content,
    ContentType: 'text/plain'
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error uploading file:', error);
    return false;
  }
}

async function getFile(roomId, fileName) {
  const key = `${roomId}/${fileName}`;
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  try {
    const response = await s3Client.send(command);
    const content = await response.Body.transformToString();
    return content;
  } catch (error) {
    console.error('Error getting file:', error);
    return null;
  }
}

async function deleteFile(roomId, fileName) {
  const key = `${roomId}/${fileName}`;
  
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

module.exports = {
  uploadFile,
  getFile,
  deleteFile
};
