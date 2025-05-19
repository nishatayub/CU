// Utility functions for tldraw document socket sync
// You can enhance these if you use a more complex tldraw document structure
export function serializeTldraw(doc) {
  try {
	return JSON.stringify(doc);
  } catch (e) {
	return null;
  }
}

export function deserializeTldraw(str) {
  try {
	return JSON.parse(str);
  } catch (e) {
	return null;
  }
}