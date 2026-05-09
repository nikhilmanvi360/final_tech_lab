import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(express.json());
app.use(cookieParser());

// --- Multiplayer Sync ---
const teamStates = new Map<string, any>();

const getCookieValue = (cookieHeader: string | undefined, name: string) => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
  if (!cookie) return null;

  return decodeURIComponent(cookie.slice(name.length + 1));
};

const getSocketToken = (socket: any) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  return getCookieValue(socket.handshake.headers.cookie, 'tech_detective_token');
};

const verifySocketUser = (socket: any) => {
  const token = getSocketToken(socket);
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_team', async ({ role }) => {
    const user = verifySocketUser(socket);
    if (!user?.name) {
      socket.emit('auth_error', { error: 'Unauthorized socket connection' });
      socket.disconnect(true);
      return;
    }

    const teamName = user.name;
    socket.join(teamName);
    socket.data = { teamName, role: role || 'Unknown Operative', userId: user.id };
    const sockets = await io.in(teamName).fetchSockets();
    io.to(teamName).emit('team_status', {
      message: `${socket.data.role} joined the session.`,
      activeRoles: sockets.map(s => s.data.role)
    });
    
    // Send current state
    const state = teamStates.get(teamName) || {};
    socket.emit('sync_state_full', state);
  });

  socket.on('update_state', ({ key, value }) => {
    const teamName = socket.data.teamName;
    if (!teamName || typeof key !== 'string') return;
    
    const state = teamStates.get(teamName) || {};
    state[key] = value;
    teamStates.set(teamName, state);
    
    // Broadcast to others in the team
    socket.to(teamName).emit('sync_state_patch', { key, value });
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    const teamName = socket.data.teamName;
    if (teamName) {
      const sockets = await io.in(teamName).fetchSockets();
      io.to(teamName).emit('team_status', {
        message: `${socket.data.role} disconnected.`,
        activeRoles: sockets.map((s: any) => s.data.role)
      });
    }
  });
});


// --- Supabase Client ---
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:8000';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Auth Middleware ---
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['tech_detective_token'] || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// --- API Routes (Phase 2 Auth) ---
const globalFirstSolves = new Set<string>();
// activeInterceptCode removed

// Game Core State
let currentMultiplier = 1;
const teamStrikes = new Map<string, { strikes: number, lockedUntil: number }>();

const recordScoreEvent = async (
  teamId: number | undefined,
  eventType: string,
  points: number,
  metadata: Record<string, any> = {},
) => {
  if (!teamId) return null;

  const { error } = await supabase.from('score_events').insert([
    {
      team_id: teamId,
      event_type: eventType,
      points,
      metadata,
    },
  ]);

  if (error) {
    console.error('Failed to record score event:', error.message);
    throw error;
  }

  const { data: team, error: scoreError } = await supabase
    .from('teams')
    .select('name, score')
    .eq('id', teamId)
    .single();

  if (scoreError) {
    console.error('Failed to fetch updated score:', scoreError.message);
    return null;
  }

  io.emit('team_score_update', {
    teamId,
    teamName: team.name,
    score: team.score,
  });

  return team.score;
};

const hasScoreEvent = async (
  teamId: number | undefined,
  eventType: string,
  metadataFilter?: Record<string, any>,
) => {
  if (!teamId) return false;

  let query = supabase
    .from('score_events')
    .select('id')
    .eq('team_id', teamId)
    .eq('event_type', eventType)
    .limit(1);

  if (metadataFilter) {
    query = query.contains('metadata', metadataFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Boolean(data?.length);
};

const hasGlobalScoreEvent = async (
  eventType: string,
  metadataFilter?: Record<string, any>,
) => {
  let query = supabase
    .from('score_events')
    .select('id')
    .eq('event_type', eventType)
    .limit(1);

  if (metadataFilter) {
    query = query.contains('metadata', metadataFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Boolean(data?.length);
};

// Adversary Events removed

app.post('/api/systems/win', authenticateToken, async (req, res) => {
  const score = Number(req.body.score);
  if (!Number.isInteger(score) || score < 0 || score > 10) {
    return res.status(400).json({ error: 'Invalid score' });
  }

  try {
    if (await hasScoreEvent(req.user?.id, 'math_assessment')) {
      return res.status(409).json({ error: 'Math assessment already submitted' });
    }

    const points = score * 10;
    const updatedScore = await recordScoreEvent(req.user?.id, 'math_assessment', points, { score });
    io.emit('score_event', { message: `[DIAGNOSTIC] ${req.user?.name} scored ${score} on Math Assessment (+${points} PTS)` });
    res.json({ success: true, score: updatedScore });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record score' });
  }
});

// Anti-Bruteforce Global Fail Route
app.post('/api/systems/fail', authenticateToken, (req, res) => {
  const teamName = req.user?.name;
  if (!teamName) return res.status(401).json({ error: 'Auth required' });
  
  const record = teamStrikes.get(teamName) || { strikes: 0, lockedUntil: 0 };
  
  if (Date.now() > record.lockedUntil) {
    record.strikes += 1;
    if (record.strikes >= 3) {
      record.lockedUntil = Date.now() + 60000; // 1 minute lockout
      record.strikes = 0;
      io.emit('score_event', { message: `[ANTI-BRUTEFORCE] ${teamName} triggered security protocols and is LOCKED for 60s.` });
      io.emit('lockout_event', { target: teamName, duration: 60000 });
    }
  }
  
  teamStrikes.set(teamName, record);
  res.json({ strikes: record.strikes, isLocked: Date.now() < record.lockedUntil });
});

// Admin Control for Multipliers
app.post('/api/admin/overclock', authenticateToken, requireAdmin, (req, res) => {
  const { multiplier } = req.body;
  currentMultiplier = multiplier;
  io.emit('multiplier_update', { multiplier });
  io.emit('score_event', { message: `[OVERCLOCK] All network rewards are now operating at ${multiplier}X multiplier!` });
  res.json({ success: true, multiplier });
});

// Mock teams removed to strictly rely on Supabase

app.get('/api/admin/teams', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('teams').select('id, name, score, is_disabled, members');
    if (error) throw error;

    const enrichedData = data.map(t => ({
      ...t,
      is_online: io.sockets.adapter.rooms.has(t.name)
    }));

    res.json({ teams: enrichedData });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch teams' });
  }
});

app.post('/api/admin/teams', authenticateToken, requireAdmin, async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Name and password required' });
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  try {
    const { data, error } = await supabase.from('teams').insert([
      { name, password: hashedPassword, role: role || 'detective', score: 0, is_disabled: false }
    ]).select('id, name, score, is_disabled, members').single();
    
    if (error) throw error;
    res.json({ success: true, team: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create team' });
  }
});

app.post('/api/admin/teams/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  const teamId = parseInt(req.params.id);
  const { disabled } = req.body;
  
  try {
    const { error } = await supabase.from('teams').update({ is_disabled: disabled }).eq('id', teamId);
    if (error) throw error;
    res.json({ success: true, is_disabled: disabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update team status' });
  }
});

app.put('/api/admin/teams/:id/members', authenticateToken, requireAdmin, async (req, res) => {
  const teamId = parseInt(req.params.id);
  const { members } = req.body;
  
  try {
    const { error } = await supabase.from('teams').update({ members }).eq('id', teamId);
    if (error) throw error;
    res.json({ success: true, members });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update members' });
  }
});

app.delete('/api/admin/teams/:id', authenticateToken, requireAdmin, async (req, res) => {
  const teamId = parseInt(req.params.id);
  try {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete team' });
  }
});

app.post('/api/terminal/execute', authenticateToken, async (req, res) => {
  res.status(400).json({ error: 'Command unrecognized or expired.' });
});

app.post('/api/broker/hint', authenticateToken, async (req, res) => {
  try {
    const updatedScore = await recordScoreEvent(req.user?.id, 'broker_hint', -50);
    io.emit('score_event', { message: `[INFORMATION BROKER] ${req.user?.name} sacrificed 50 PTS to intercept an encrypted clue.` });
    res.json({ success: true, score: updatedScore, hint: "The gap in the timeline is exactly 11 minutes." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record score' });
  }
});

app.post('/api/blackmarket/buy', authenticateToken, async (req, res) => {
  const { item, targetTeam } = req.body;
  if (!item || !targetTeam) return res.status(400).json({ error: 'Item and target team required' });

  try {
    const updatedScore = await recordScoreEvent(req.user?.id, 'blackmarket_buy', -50, { item, targetTeam });
    io.emit('sabotage', { target: targetTeam, by: req.user?.name, item });
    io.emit('score_event', { message: `[BLACK MARKET] ${targetTeam} was hit by a sensory disruption attack!` });
    res.json({ success: true, score: updatedScore });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record score' });
  }
});

app.post('/api/r0/submit', authenticateToken, async (req, res) => {
  const task = req.body.task;
  let msg = `${req.user?.name} completed Round 0 Diagnostic: ${task}.`;
  try {
    if (
      task &&
      !globalFirstSolves.has(`r0_${task}`) &&
      !(await hasGlobalScoreEvent('round0_first_solve', { task }))
    ) {
      globalFirstSolves.add(`r0_${task}`);
      await recordScoreEvent(req.user?.id, 'round0_first_solve', 50, { task });
      msg = `[FIRST BLOOD] ${req.user?.name} was the FIRST to connect: ${task}! (+50 Pts)`;
    }
    io.emit('score_event', { message: msg });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record score' });
  }
});

app.post('/api/r1/claim', authenticateToken, async (req, res) => {
  const code = req.body.code;
  let msg = `${req.user?.name} recovered a new evidence fragment in ARCHIVE.`;
  try {
    if (
      code &&
      !globalFirstSolves.has(`r1_${code}`) &&
      !(await hasGlobalScoreEvent('round1_first_solve', { code }))
    ) {
      globalFirstSolves.add(`r1_${code}`);
      await recordScoreEvent(req.user?.id, 'round1_first_solve', 50, { code });
      msg = `[FIRST BLOOD] ${req.user?.name} was the FIRST to extract evidence ${code}! (+50 Pts)`;
    }
    io.emit('score_event', { message: msg });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record score' });
  }
});

// Login Rate Limiter (Simple in-memory for preview)
const loginAttempts = new Map<string, { count: number, resetTime: number }>();

app.post('/api/auth/login', async (req, res) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (attempt && now < attempt.resetTime) {
    if (attempt.count >= 5) return res.status(429).json({ error: 'Too many attempts. Try again in 1 minute.' });
    attempt.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetTime: now + 60 * 1000 });
  }

  const { teamName, password } = req.body;
  if (!teamName || !password) return res.status(400).json({ error: 'Missing credentials' });

  // Use a mock login if Supabase fails for previewability
  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('name', teamName)
      .single();

    if (error || !team) {
      return res.status(401).json({ error: 'Invalid credentials or team not found' });
    }

    if (team.is_disabled) {
      return res.status(403).json({ error: 'Team account is disabled' });
    }

    const validPassword = bcrypt.compareSync(password, team.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: team.id, name: team.name, role: team.role, tokenVersion: team.token_version },
      JWT_SECRET,
      { expiresIn: '48h' }
    );

    res.cookie('tech_detective_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 48 * 60 * 60 * 1000
    });

    res.json({ team: { id: team.id, name: team.name, score: team.score, role: team.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Database error during login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('tech_detective_token');
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies['tech_detective_token'] || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.json({ error: 'Unauthorized', authenticated: false });

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) return res.json({ error: 'Forbidden', authenticated: false });
    
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('id, name, score, role')
        .eq('id', user.id)
        .single();

      if (error || !team) return res.json({ error: 'Team not found', authenticated: false });
      res.json({ team });
    } catch (dbErr: any) {
      res.json({ team: user });
    }
  });
});

// Vite Middleware
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: httpServer
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, '..', 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'dist/index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

// trigger reload
