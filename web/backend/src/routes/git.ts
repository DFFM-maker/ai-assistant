import express from 'express';
import { simpleGit, SimpleGit, StatusResult } from 'simple-git';
import path from 'path';

const router = express.Router();

// Initialize git instance pointing to the project root
const getGitInstance = (): SimpleGit => {
  const projectRoot = path.resolve(__dirname, '../../../..');
  return simpleGit(projectRoot);
};

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get Git status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const git = getGitInstance();
    const status: StatusResult = await git.status();
    
    res.json({
      current: status.current,
      tracking: status.tracking,
      ahead: status.ahead,
      behind: status.behind,
      staged: status.staged,
      modified: status.modified,
      not_added: status.not_added,
      conflicted: status.conflicted,
      created: status.created,
      deleted: status.deleted,
      renamed: status.renamed,
      files: status.files
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({ 
      error: 'Failed to get git status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recent commits
router.get('/commits', requireAuth, async (req, res) => {
  try {
    const git = getGitInstance();
    const limit = parseInt(req.query.limit as string) || 10;
    
    const log = await git.log({ maxCount: limit });
    
    const commits = log.all.map(commit => ({
      hash: commit.hash,
      date: commit.date,
      message: commit.message,
      author_name: commit.author_name,
      author_email: commit.author_email
    }));
    
    res.json(commits);
  } catch (error) {
    console.error('Git commits error:', error);
    res.status(500).json({ 
      error: 'Failed to get git commits',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Commit changes
router.post('/commit', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Commit message is required' });
    }
    
    const git = getGitInstance();
    
    // Add all changes
    await git.add('.');
    
    // Commit with message
    const result = await git.commit(message.trim());
    
    res.json({
      success: true,
      commit: result.commit,
      summary: result.summary
    });
  } catch (error) {
    console.error('Git commit error:', error);
    res.status(500).json({ 
      error: 'Failed to commit changes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Push changes
router.post('/push', requireAuth, async (req, res) => {
  try {
    const git = getGitInstance();
    
    // Get current branch
    const status = await git.status();
    const currentBranch = status.current;
    
    if (!currentBranch) {
      return res.status(400).json({ error: 'No current branch found' });
    }
    
    // Push to origin
    const result = await git.push('origin', currentBranch);
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Git push error:', error);
    res.status(500).json({ 
      error: 'Failed to push changes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Pull changes
router.post('/pull', requireAuth, async (req, res) => {
  try {
    const git = getGitInstance();
    
    // Pull from origin
    const result = await git.pull('origin');
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Git pull error:', error);
    res.status(500).json({ 
      error: 'Failed to pull changes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get branch information
router.get('/branches', requireAuth, async (req, res) => {
  try {
    const git = getGitInstance();
    
    const branches = await git.branch(['-a']);
    
    res.json({
      current: branches.current,
      all: branches.all,
      branches: branches.branches
    });
  } catch (error) {
    console.error('Git branches error:', error);
    res.status(500).json({ 
      error: 'Failed to get git branches',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;