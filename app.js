import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.get('/loan', (req, res) => {
    const absPath = path.resolve('./forms/loanform.html');
    res.sendFile(absPath)
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});