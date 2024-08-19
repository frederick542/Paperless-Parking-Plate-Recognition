import fs from 'fs';
import path from 'path';

const getFilePath = (filePath: string) => path.resolve(filePath);

const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    }
  });
};

export { getFilePath, deleteFile };
