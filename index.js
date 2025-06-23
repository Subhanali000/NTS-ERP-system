require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/managerRoutes');
const directorRoutes = require('./routes/directorRoutes');
const documentRoutes = require('./routes/documentRoutes');


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/director', directorRoutes);
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});