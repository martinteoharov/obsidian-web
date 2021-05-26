const express   = require('express');
const env       = require('dotenv').config();
const app       = express();
const directory = require('serve-index');

console.log(env);
const port = process.env.PORT || 3000;

app.use(express.static('static'));
app.use(express.static('html'));
app.use(directory('html'));

app.get('/graph.json', (req, res) => {
	res.sendFile(__dirname + '/graph.json');
});


app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});
