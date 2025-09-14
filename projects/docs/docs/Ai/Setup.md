# Setup VM Proxmox per AI Documentazione MD + Supporto SysmacStudio

## Specifiche VM Consigliate

### Hardware VM
- **RAM**: 16GB (12GB per AI + 4GB sistema)
- **CPU**: 6-8 cores
- **Storage**: 100GB SSD
- **OS**: Ubuntu 22.04 LTS Server + Desktop Environment leggero

### Motivazione Specs
- SysmacStudio può essere pesante se usato tramite Wine/VM Windows
- I modelli AI per programmazione PLC richiedono più context

## Installazione Base Sistema

```bash
# Update sistema
sudo apt update && sudo apt upgrade -y

# Installa desktop environment leggero
sudo apt install ubuntu-desktop-minimal -y

# Strumenti sviluppo
sudo apt install git curl wget build-essential python3-pip nodejs npm -y

# Docker per container AI
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
```

## Setup Ollama per Documentazione + PLC

```bash
# Installa Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Modelli specializzati
ollama pull codellama:13b-instruct    # Per programmazione generale
ollama pull deepseek-coder:6.7b      # Ottimo per documentazione tecnica
ollama pull mistral:7b-instruct      # Buono per spiegazioni tecniche
ollama pull phind-codellama:34b       # Se hai RAM sufficiente, eccellente per coding
```

## Configurazione Ambiente Documentazione

```bash
# Node.js per Docusaurus/GitLab Pages
npm install -g @docusaurus/core @docusaurus/preset-classic

# Python tools per processing
pip3 install markdown beautifulsoup4 pyyaml jinja2

# Strumenti markdown avanzati
npm install -g markdownlint-cli prettier
```

## Script Automatizzazione Documentazione

### Script Generatore MD (`generate_docs.py`)
```python
#!/usr/bin/env python3
import os
import requests
import json
from datetime import datetime

class OllamaDocGenerator:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
        self.model = "deepseek-coder:6.7b"
    
    def generate_md_page(self, topic, context=""):
        prompt = f"""
        Crea una pagina di documentazione Markdown per: {topic}
        
        Context: {context}
        
        La pagina deve includere:
        - Header con metadata frontmatter
        - Introduzione
        - Sezioni tecniche dettagliate
        - Esempi pratici
        - Note e warning box
        - Collegamenti correlati
        
        Formato output: Markdown puro compatibile con Docusaurus
        """
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9
            }
        }
        
        response = requests.post(self.ollama_url, json=payload)
        if response.status_code == 200:
            return response.json()["response"]
        return None
    
    def create_plc_documentation(self, program_path):
        # Analizza file SysmacStudio e genera docs
        # Placeholder per logica più complessa
        pass

# Uso
generator = OllamaDocGenerator()
content = generator.generate_md_page(
    "Configurazione I/O SysmacStudio", 
    "Documentazione per configurazione moduli I/O in ambiente industriale"
)

with open("docs/sysmac-io-config.md", "w") as f:
    f.write(content)
```

### Script Assistente PLC (`plc_assistant.py`)
```python
#!/usr/bin/env python3
import requests

class PLCAssistant:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
        self.model = "codellama:13b-instruct"
    
    def analyze_ladder_code(self, code_snippet):
        prompt = f"""
        Analizza questo codice Ladder Logic di SysmacStudio:
        
        {code_snippet}
        
        Fornisci:
        1. Spiegazione della logica
        2. Possibili ottimizzazioni
        3. Potenziali problemi
        4. Best practices Omron
        5. Documentazione suggerita
        
        Rispondi in italiano con terminologia tecnica PLC.
        """
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(self.ollama_url, json=payload)
        return response.json()["response"] if response.status_code == 200 else None
    
    def suggest_structured_text(self, requirements):
        prompt = f"""
        Crea codice Structured Text per SysmacStudio basato su questi requisiti:
        
        {requirements}
        
        Il codice deve:
        - Seguire standard IEC 61131-3
        - Usare convenzioni Omron
        - Includere commenti esplicativi
        - Gestire error handling
        - Essere modulare e riutilizzabile
        """
        # Implementazione simile...
        pass
```

## Configurazione SysmacStudio Support

### Wine per SysmacStudio (se necessario)
```bash
# Installa Wine per eseguire SysmacStudio
sudo apt install wine64 winetricks -y

# Configura wine per applicazioni Omron
winecfg
```

### VM Windows Nested (Alternativa)
```bash
# Se preferisci VM Windows dentro Proxmox per SysmacStudio
# Configura passthrough USB per programmatori Omron
# Abilita nested virtualization nel host Proxmox
```

## Web Interface per AI Assistant

### Simple Flask App (`web_assistant.py`)
```python
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('assistant.html')

@app.route('/generate_docs', methods=['POST'])
def generate_docs():
    topic = request.json.get('topic')
    context = request.json.get('context', '')
    
    # Chiamata a Ollama
    payload = {
        "model": "deepseek-coder:6.7b",
        "prompt": f"Crea documentazione MD per: {topic}. Context: {context}",
        "stream": False
    }
    
    response = requests.post("http://localhost:11434/api/generate", json=payload)
    
    if response.status_code == 200:
        return jsonify({"content": response.json()["response"]})
    return jsonify({"error": "Errore generazione"}), 500

@app.route('/analyze_plc', methods=['POST'])
def analyze_plc():
    code = request.json.get('code')
    # Logica analisi PLC con Ollama
    # ...
    return jsonify({"analysis": "Analisi completata"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

## Template HTML per Web Interface

### `templates/assistant.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>AI Assistant - Documentazione & PLC</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; }
        textarea { width: 100%; height: 200px; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; }
        .output { background: #f5f5f5; padding: 15px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Assistant - Documentazione & SysmacStudio</h1>
        
        <div class="section">
            <h2>Generatore Documentazione MD</h2>
            <input type="text" id="topic" placeholder="Argomento documentazione">
            <textarea id="context" placeholder="Contesto aggiuntivo..."></textarea>
            <button onclick="generateDocs()">Genera Documentazione</button>
            <div class="output" id="docs-output"></div>
        </div>
        
        <div class="section">
            <h2>Analizzatore Codice PLC</h2>
            <textarea id="plc-code" placeholder="Incolla qui il codice Ladder/ST..."></textarea>
            <button onclick="analyzePLC()">Analizza Codice</button>
            <div class="output" id="plc-output"></div>
        </div>
    </div>

    <script>
        async function generateDocs() {
            const topic = document.getElementById('topic').value;
            const context = document.getElementById('context').value;
            
            const response = await fetch('/generate_docs', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({topic, context})
            });
            
            const data = await response.json();
            document.getElementById('docs-output').innerHTML = 
                '<pre>' + data.content + '</pre>';
        }
        
        async function analyzePLC() {
            const code = document.getElementById('plc-code').value;
            
            const response = await fetch('/analyze_plc', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({code})
            });
            
            const data = await response.json();
            document.getElementById('plc-output').innerHTML = 
                '<pre>' + data.analysis + '</pre>';
        }
    </script>
</body>
</html>
```

## Integrazione GitLab CI/CD

### `.gitlab-ci.yml` per auto-deploy
```yaml
stages:
  - generate-docs
  - build
  - deploy

generate-docs:
  image: python:3.9
  stage: generate-docs
  script:
    - pip install requests pyyaml
    - python scripts/auto_generate_docs.py
  artifacts:
    paths:
      - docs/generated/

build-site:
  image: node:18
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - build/

pages:
  stage: deploy
  script:
    - cp -r build/* public/
  artifacts:
    paths:
      - public/
  only:
    - main
```

## Comandi Utili

```bash
# Avvia tutti i servizi
./start_services.sh

# Genera documentazione automatica
python3 generate_docs.py --topic "Motion Control" --output docs/

# Analizza progetto SysmacStudio
python3 plc_assistant.py --analyze project.smc

# Deploy su GitLab Pages
git add . && git commit -m "Update docs" && git push
```

## Note Aggiuntive

- **Backup regolare**: I modelli AI scaricati occupano spazio
- **Monitoring risorse**: Tieni d'occhio RAM/CPU durante inferenza
- **Versioning**: Mantieni versioni diverse dei modelli per test
- **Security**: Accesso web interface solo da rete fidata
- **Performance**: Considera GPU passthrough se disponibile in Proxmox

## Modelli Specializzati Aggiuntivi (Opzionale)

```bash
# Per documentazione tecnica avanzata
ollama pull wizard-vicuna:13b

# Per traduzioni multilingue
ollama pull aya:8b

# Per analisi codice molto complessa
ollama pull magicoder:7b-s-cl-q4_0
```