import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

const languageMap = {
  'js': 'javascript',
  'py': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'cs': 'csharp',
  'go': 'go',
  'rb': 'ruby',
  'rs': 'rust',
  'php': 'php'
};

export const getLanguageFromExtension = (ext) => {
  return languageMap[ext];
};

export const executeCode = async (code, language) => {
  try {
    const response = await axios.post(PISTON_API_URL, {
      language,
      version: '*',
      files: [{ content: code }]
    });

    return {
      output: response.data.run.output,
      isError: !!response.data.run.stderr
    };
  } catch (error) {
    throw new Error(`Execution failed: ${error.message}`);
  }
};