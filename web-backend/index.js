const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/products', require('./routes/products'));
app.use('/stock', require('./routes/stock'));
app.use('/sold', require('./routes/sold'));
app.use('/totals', require('./routes/totals'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
