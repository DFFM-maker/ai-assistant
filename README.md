# AI Assistant - DFFM

## Descrizione

AI Assistant per DFFM, progettato per integrazione locale con modelli Ollama e backend Express con autenticazione OAuth2 GitLab DFFM.  
Supporta frontend React/Vue, versionamento Git, generazione codice industriale e chat AI.

---

## Prerequisiti

- Ubuntu 22.04
- Node.js (>=18)
- npm
- Python (per moduli AI, se richiesto)
- Ollama con modelli scaricati (`llama2:13b-chat`, `magicoder:7b-s-cl`, `mistral:7b-instruct`, `deepseek-coder:6.7b`)
- Istanza GitLab DFFM con OAuth2 abilitato

---

## Struttura principale

- `/CONTEXT.md` → Stato e dipendenze del progetto
- `/README.md` → Guida e onboarding
- `/web/backend/` → Backend Express (OAuth2 GitLab DFFM)
- `/web/frontend/` → Frontend React/Vue (skeleton app)
- `/templates/`, `/scripts/`, `/logs/` → Utilità e gestione

---

## Setup rapido

1. **Crea le directory base:**
   ```bash
   sudo mkdir -p /opt/ai-assistant/{projects,templates,scripts,logs}
   sudo chown -R aiuser:aiuser /opt/ai-assistant
   ```

2. **Configura il servizio systemd:**
   Esempio file `/etc/systemd/system/ai-assistant.service`:
   ```
   [Unit]
   Description=AI Assistant per DFFM
   After=network.target ollama.service
   Wants=network.target
   Requires=ollama.service

   [Service]
   Type=simple
   User=aiuser
   Group=aiuser
   WorkingDirectory=/opt/ai-assistant
   Environment=PYTHONPATH=/opt/ai-assistant
   EnvironmentFile=/opt/ai-assistant/.env
   ExecStart=/opt/ai-assistant-env/bin/python /opt/ai-assistant/app.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. **Backend OAuth2 Express:**
   - Configura variabili `.env` in `/web/backend/`:
     ```
     GITLAB_CLIENT_ID=xxxxxx
     GITLAB_CLIENT_SECRET=yyyyyy
     GITLAB_BASE_URL=https://gitlab.dffm.it
     GITLAB_CALLBACK_URL=http://localhost:4000/api/auth/gitlab/callback
     GITLAB_SCOPES=read_user,read_api,api
     SECRET_KEY=una-stringa-segreta-molto-lunga-e-complessa
     NODE_ENV=development
     ```
   - Endpoints attivi: `/api/auth/gitlab`, `/api/auth/gitlab/callback`, `/api/auth/logout`, `/api/user`

4. **Front-end Skeleton:**
   - React (consigliato): layout con sidebar, pannello versioning, routing base, struttura consigliata (`components`, `services`, `assets`)
   - Stile custom (Claude.ai/GitHub Copilot)

5. **Integrazione Ollama:**
   - Service JS/TS per chiamata API REST e generazione codice industriale

6. **Versioning e Test:**
   - VersionPanel React (stato Git real-time)
   - Configurazione Jest + React Testing Library

---

## Come avviare

```bash
cd web/backend
npm install
npm run start
```
Per il frontend, vedi la guida in `/web/frontend/README.md`.

---

## Sicurezza

- Proteggi le variabili `.env` (NON committarle)
- Usa HTTPS in produzione
- Aggiorna sempre i permessi e la configurazione di sessione

---

## Troubleshooting

- Scope OAuth errati: verifica configurazione su GitLab DFFM
- Sessione/non persistenza: controlla `SECRET_KEY` e cookies
- Callback URL errata: aggiorna su GitLab e `.env`

---

## Espansioni future

- Integrazione API GitLab per operazioni repo/commits/user
- Pannello versioning evoluto
- Gestione chat AI industriale con modelli locali
- Documentazione e test automatizzati

---

## Autore

DFFM-maker
