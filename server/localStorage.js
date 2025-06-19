const fs = require('fs').promises;
const path = require('path');

class LocalStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.filesPath = path.join(this.dataDir, 'files.json');
    this.tldrawPath = path.join(this.dataDir, 'tldraw.json');
    this.roomsPath = path.join(this.dataDir, 'rooms.json');
    
    this.ensureDataDir();
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  async loadData(filePath, defaultData = {}) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return defaultData;
    }
  }

  async saveData(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // File operations
  async getFiles(roomId) {
    const files = await this.loadData(this.filesPath, {});
    return Object.entries(files[roomId] || {}).map(([fileName, content]) => ({
      fileName,
      content,
      roomId
    }));
  }

  async saveFile(roomId, fileName, content) {
    const files = await this.loadData(this.filesPath, {});
    if (!files[roomId]) files[roomId] = {};
    files[roomId][fileName] = content;
    await this.saveData(this.filesPath, files);
    return { fileName, content, roomId };
  }

  async deleteFile(roomId, fileName) {
    const files = await this.loadData(this.filesPath, {});
    if (files[roomId] && files[roomId][fileName]) {
      delete files[roomId][fileName];
      await this.saveData(this.filesPath, files);
      return true;
    }
    return false;
  }

  // TlDraw operations
  async getTldrawState(roomId) {
    const states = await this.loadData(this.tldrawPath, {});
    return states[roomId] || null;
  }

  async saveTldrawState(roomId, state) {
    const states = await this.loadData(this.tldrawPath, {});
    states[roomId] = state;
    await this.saveData(this.tldrawPath, states);
    return true;
  }
}

module.exports = new LocalStorage();
