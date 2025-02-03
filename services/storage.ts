import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data.json');

const getData = () => {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const saveData = (data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export { getData, saveData };

