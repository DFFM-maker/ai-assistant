import express from 'express';
import cors from 'cors';
import gitRoutes from './routes/git';

const app = express();

app.use(express.json()); // Add JSON body parser for POST requests

app.use(cors({
  origin: 'http://192.168.1.250:3000',
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Backend Express funzionante!');
});

app.use('/api/git', gitRoutes);

app.listen(4000, '0.0.0.0', () => {
  console.log('Backend listening on port 4000');
});