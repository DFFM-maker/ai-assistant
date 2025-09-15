1. Ecco il contesto del mio progetto ai-assistant: gira su Ubuntu 22.04 (192.168.1.250) con Ollama (modelli locali: llama2:13b-chat, magicoder:7b-s-cl, mistral:7b-instruct, deepseek-coder:6.7b),
Node.js.
2. Internet → pfSense → NPM → AI Assistant VM (Port 5000)
3 .# Crea directory structure
sudo mkdir -p /opt/ai-assistant/{projects,templates,scripts,logs}
sudo chown -R aiuser:aiuser /opt/ai-assistant
4. Creato servizio
aiuser@ai-assistant:~$ sudo cat /etc/systemd/system/ai-assistant.service
[sudo] password for aiuser:
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

5. NPM esterno (192.168.1.252)
6. PFSENSE (192.168.1.254) 
7.Richieste:
  OAuth su GitLab DFFM
8. ho giò alloama e i modelli scaricati:
   aiuser@ai-assistant:~$ ollama list
  NAME                   ID              SIZE      MODIFIED
  llama2:13b-chat        d475bf4c50bc    7.4 GB    11 hours ago
  magicoder:7b-s-cl      8007de06f5d9    3.8 GB    31 hours ago
  mistral:7b-instruct    6577803aa9a0    4.4 GB    31 hours ago
  deepseek-coder:6.7b    ce298d984115    3.8 GB    31 hours ago
9. Setup OAuth con GitLab DFFM
    “Crea un modulo Node/Express (o NestJS) che gestisca l’OAuth2 con GitLab DFFM: callback, salvataggio token, sincronizzazione utenti. Genera i file di configurazione e spiegami come registrare l’app su gitlab.dffm.it.”
10.Boilerplate Frontend
    “Generami la skeleton app in React (o Vue, scegli tu) con:
    Layout a sidebar sinistra
    Pannello versioning a destra
    Routing base (es. React Router)
   Struttura di cartelle consigliata (components, services, assets)”
11. Stile e tema
  “Applica uno stile simile a Claude.ai / GitHub Copilot: definisci un file styles.css esterno con palette colori, tipografia e utility classes. Integra il CSS nel progetto.
12. Integrazione con API Ollama
  “Scrivimi un service JS/TS (ollamaService.js) che chiama l’API REST locale di Ollama per inviare prompt ai modelli per ricevere risposte di generazione codice industriale tipo sysmacStudio Omron e Documentazione docusaurus con markdown e altro”
13. Versioning panel
  “Implementa il componente React VersionPanel che mostra in tempo reale lo stato delle modifiche Git (usa simple-git o GitLab API), con bottoni per commit, push e pull request.”
14. Test unitari e di integrazione
  “Crea configurazione Jest + React Testing Library, e scrivi almeno due test di esempio:
  Un test per il componente Sidebar
  Un test per una funzione di utilità (es. parsing OAuth token)”
15 Documentazione
  “Genera un README.md che spieghi:
  Purpose del progetto
  Prerequisiti
  Istruzioni di setup (script di bootstrap)
  Come eseguire i test e avviare in dev/prod”
15. Ottimizzazione delle richieste
  “Infine, dammi consigli su come tenere la chat ordinata: quando inviare blocchi di codice, come raggruppare i sotto-task e come usare un file CONTEXT.md per riassumere le dipendenze chiave.”
