import express from 'express';
import cors from 'cors';
import gitlabAuth from './gitlabAuth';

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://ai-assistant.dffm.it'],
  credentials: true
}));

// ...altre API...

// Auth routes
app.use('/api', gitlabAuth);

// ...altre API...

app.listen(4000, () => {
  console.log('Backend listening on port 4000');
});
