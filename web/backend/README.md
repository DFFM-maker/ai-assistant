# AI Assistant - Backend Express (GitLab DFFM OAuth)

## Descrizione

Backend Node.js/Express per autenticazione e integrazione con GitLab DFFM tramite OAuth2.  
Gestisce login, logout, sessione utente, callback OAuth e profilazione utente.  
Espone API sicure per il frontend (React/Vue).

---

## Prerequisiti

- Node.js (>=18)
- npm
- Ubuntu 22.04
- Istanza GitLab DFFM con OAuth2 abilitato
- File `.env` con variabili di configurazione (vedi sotto)

---

## Setup

1. **Clona la repo:**
   ```bash
   git clone https://github.com/DFFM-maker/ai-assistant.git
   cd ai-assistant/web/backend
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **Configura il file `.env`** nella directory `backend`:
   ```
   GITLAB_CLIENT_ID=xxxxxx
   GITLAB_CLIENT_SECRET=yyyyyy
   GITLAB_BASE_URL=https://gitlab.dffm.it
   GITLAB_CALLBACK_URL=http://localhost:4000/api/auth/gitlab/callback
   GITLAB_SCOPES=read_user,read_api,api
   SECRET_KEY=una-stringa-segreta-molto-lunga-e-complessa
   NODE_ENV=development
   ```

4. **Avvia il backend:**
   ```bash
   npm run start
   # oppure per sviluppo
   npm run dev
   ```

---

## Endpoints principali

- **[GET] `/api/auth/gitlab`**  
  Avvia il login OAuth con GitLab DFFM

- **[GET] `/api/auth/gitlab/callback`**  
  Callback dopo login (gestisce sessione e token)

- **[GET] `/api/auth/logout`**  
  Logout utente

- **[GET] `/api/user`**  
  Restituisce informazioni utente autenticato (id, username, avatar, accessToken OAuth)

---

## Configurazione OAuth su GitLab DFFM

1. Vai su **Impostazioni → Applications** nella tua istanza GitLab DFFM.
2. Registra una nuova applicazione:
   - **Redirect URI:**  
     `http://localhost:4000/api/auth/gitlab/callback`  
     (in produzione: `https://ai-assistant.dffm.it/api/auth/gitlab/callback`)
   - **Scopes:**  
     `read_user`, `read_api`, `api`
   - **Client ID e Secret:**  
     Copia nei rispettivi campi del file `.env`.

---

## Troubleshooting

- **Errore "The requested scope is invalid, unknown, or malformed":**  
  Verifica che gli scope siano scritti correttamente e supportati dalla tua istanza GitLab.
- **Sessione non persiste:**  
  Assicurati che `SECRET_KEY` sia configurata e che cookie/session siano abilitati.
- **Callback URL errata:**  
  Aggiorna il campo in GitLab e nel file `.env` per ambiente di produzione/dev.

---

## Sicurezza

- **NON committare mai il file `.env` con dati sensibili**
- Proteggi la sessione e usa HTTPS in produzione

---

## Espansioni future

- Integrazione API GitLab per operazioni repo/commits/user
- Connessione con Ollama (AI model service)
- Frontend React/Vue per pannello versioning e chat

---

## Autore

DFFM-maker