# Frontend (React) Setup

```bash
cd frontend
npx create-react-app food-classifier-ui
cd food-classifier-ui
npm install axios recharts
```

Example component to call API:

```jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function Uploader() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const { data } = await axios.post('http://localhost:5000/predict', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setResult(data);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Predict</button>
      </form>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
```
