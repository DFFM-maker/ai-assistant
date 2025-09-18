# AI Assistant - DFFM

## Descrizione

AI Assistant per DFFM, progettato per integrazione locale con modelli Ollama e backend Express.  
Supporta frontend React, versionamento Git automatico tramite ai-bot, generazione codice industriale e chat AI.

---

## Prerequisiti

- Ubuntu 22.04
- Node.js (>=18)
- npm
- Python (per moduli AI, se richiesto)
- Ollama con modelli scaricati (`llama2:13b-chat`, `magicoder:7b-s-cl`, `mistral:7b-instruct`, `deepseek-coder:6.7b`)
- ai-bot configurato per versioning automatico

---

## Struttura principale

- `/CONTEXT.md` → Stato e dipendenze del progetto
- `/README.md` → Guida e onboarding
- `/web/backend/` → Backend Express (senza autenticazione)
- `/web/frontend/` → Frontend React
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

3. **Backend Express (senza autenticazione):**
   - Il backend ora funziona senza autenticazione
   - Tutti i versioning vengono gestiti automaticamente tramite ai-bot
   - Endpoints rimossi: `/api/auth/gitlab`, `/api/auth/gitlab/callback`, `/api/auth/logout`, `/api/user`
   - Endpoints attivi: solo `/api/git` per operazioni Git

4. **Front-end React:**
   - React con layout sidebar, pannello versioning, routing base
   - Nessuna autenticazione richiesta - accesso diretto all'applicazione
   - Struttura consigliata (`components`, `services`, `assets`)
   - Stile custom (Claude.ai/GitHub Copilot)

5. **Integrazione Ollama:**
   - Service JS/TS per chiamata API REST e generazione codice industriale

6. **Versioning automatico con ai-bot:**
   - Tutti i versioning e operazioni Git vengono gestiti automaticamente dall'utente ai-bot
   - Nessuna configurazione OAuth richiesta
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
