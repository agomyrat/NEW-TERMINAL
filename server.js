const dotenv = require('dotenv');
const app = require('./app');

if (process.env.NODE_ENV) {
    dotenv.config({ path: './config/config-dev.env' });
} else {
    dotenv.config({ path: 'config/config.env' });
}
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`App is running on port: ${PORT}, http://localhost:${PORT}/`);
});
