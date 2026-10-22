from flask import Flask, render_template, jsonify, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import json, os, sqlite3
from pathlib import Path
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'change-this-secret-key-in-render')
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE='Lax', SESSION_COOKIE_SECURE=os.environ.get('RENDER') is not None)
BASE = Path(__file__).parent
DATA = BASE / 'data' / 'questions.json'
DB = Path(os.environ.get('DATABASE_PATH', str(BASE / 'englishpath.db')))

def connect_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect_db() as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)')
        conn.execute('CREATE TABLE IF NOT EXISTS progress (user_id INTEGER PRIMARY KEY, progress_json TEXT NOT NULL DEFAULT \'{"xp":0,"correct":0,"streak":0,"lastDate":""}\', FOREIGN KEY(user_id) REFERENCES users(id))')
init_db()

def login_required(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if 'user_id' not in session:
            if request.path.startswith('/api/'):
                return jsonify({'error':'Inicia sesión para continuar'}), 401
            return redirect(url_for('login'))
        return fn(*args, **kwargs)
    return wrapped

@app.get('/login')
def login():
    if session.get('user_id'): return redirect(url_for('home'))
    return render_template('auth.html', mode='login')

@app.post('/login')
def login_post():
    identity = request.form.get('identity','').strip().lower()
    password = request.form.get('password','')
    with connect_db() as conn:
        user = conn.execute('SELECT * FROM users WHERE email=? OR username=?', (identity, identity)).fetchone()
    if not user or not check_password_hash(user['password_hash'], password):
        flash('Usuario/correo o contraseña incorrectos.')
        return redirect(url_for('login'))
    session.clear(); session['user_id'] = user['id']; session['username'] = user['username']
    return redirect(url_for('home'))

@app.get('/register')
def register():
    if session.get('user_id'): return redirect(url_for('home'))
    return render_template('auth.html', mode='register')

@app.post('/register')
def register_post():
    username = request.form.get('username','').strip()
    email = request.form.get('email','').strip().lower()
    password = request.form.get('password','')
    if len(username) < 3 or len(username) > 30:
        flash('El nombre de usuario debe tener entre 3 y 30 caracteres.'); return redirect(url_for('register'))
    if '@' not in email or len(email) > 200:
        flash('Introduce un correo electrónico válido.'); return redirect(url_for('register'))
    if len(password) < 8:
        flash('La contraseña debe tener al menos 8 caracteres.'); return redirect(url_for('register'))
    try:
        with connect_db() as conn:
            cur = conn.execute('INSERT INTO users(username,email,password_hash) VALUES(?,?,?)', (username,email,generate_password_hash(password)))
            conn.execute('INSERT INTO progress(user_id, progress_json) VALUES(?,?)', (cur.lastrowid, json.dumps({'xp':0,'correct':0,'streak':0,'lastDate':''})))
        session.clear(); session['user_id'] = cur.lastrowid; session['username'] = username
        return redirect(url_for('home'))
    except sqlite3.IntegrityError:
        flash('Ese nombre de usuario o correo ya está registrado.'); return redirect(url_for('register'))

@app.post('/logout')
def logout():
    session.clear(); return redirect(url_for('login'))

@app.get('/')
@login_required
def home():
    return render_template('index.html', username=session.get('username'))

@app.get('/api/progress')
@login_required
def get_progress():
    with connect_db() as conn:
        row = conn.execute('SELECT progress_json FROM progress WHERE user_id=?', (session['user_id'],)).fetchone()
    return jsonify(json.loads(row['progress_json']) if row else {'xp':0,'correct':0,'streak':0,'lastDate':''})

@app.post('/api/progress')
@login_required
def save_progress():
    payload = request.get_json(silent=True) or {}
    safe = {k: payload.get(k) for k in ('xp','correct','streak','lastDate')}
    if not all(isinstance(safe[k], int) and safe[k] >= 0 for k in ('xp','correct','streak')) or not isinstance(safe['lastDate'], str):
        return jsonify({'error':'Progreso no válido'}), 400
    with connect_db() as conn:
        conn.execute('INSERT INTO progress(user_id,progress_json) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET progress_json=excluded.progress_json', (session['user_id'], json.dumps(safe)))
    return jsonify({'ok':True})

@app.get('/api/questions')
@login_required
def questions():
    return jsonify(json.loads(DATA.read_text(encoding='utf-8')))

@app.post('/api/check')
@login_required
def check():
    payload = request.get_json(silent=True) or {}
    question_id, answer = payload.get('id'), payload.get('answer')
    bank = json.loads(DATA.read_text(encoding='utf-8'))
    item = next((q for q in bank if q['id'] == question_id), None)
    if item is None: return jsonify({'error':'Pregunta no encontrada'}), 404
    correct = answer == item['answer']
    return jsonify({'correct':correct,'explanation':item['explanation'],'correctAnswer':item['options'][item['answer']]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT','10000')), debug=False)
