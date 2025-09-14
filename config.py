# /opt/ai-assistant/config.py
import os

class Config:
    # GitLab Integration DFFM
    GITLAB_URL = "https://gitlab.dffm.it"
    GITLAB_TOKEN = os.getenv("GITLAB_TOKEN", "")  # Token dell'utente ai-bot
    GITLAB_USER = "ai-bot"
    
    # Ollama Configuration
    OLLAMA_URL = "http://localhost:11434"
    DEFAULT_MODEL = "magicoder:7b-s-cl"      # Il primo che stai scaricando
    CODE_MODEL = "codellama:13b-instruct"    # Per PLC programming
    DOCS_MODEL = "deepseek-coder:6.7b"       # Per documentazione
    
    # Server Configuration (per NPM)
    HOST = "0.0.0.0"                         # Bind su tutte le interfacce
    PORT = 5000                              # Porta per NPM reverse proxy
    DEBUG = False
    USE_PROXY = True                         # Dietro NPM proxy
    TRUST_PROXY = True                       # Trust X-Forwarded headers
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'zse123zse!!-production')
    
    # Paths
    WORKSPACE_DIR = "/opt/ai-assistant/workspace"
    PROJECTS_DIR = "/opt/ai-assistant/projects"
    BACKUP_DIR = "/opt/ai-assistant/backup"
    LOG_DIR = "/opt/ai-assistant/logs"
    TEMPLATES_DIR = "/opt/ai-assistant/templates"
    
    # Performance ottimizzate per 24 cores / 64GB RAM
    MAX_WORKERS = 12                         # Thread pool per richieste
    REQUEST_TIMEOUT = 900                    # 15 min per modelli grandi
    MAX_CONTEXT_LENGTH = 8192                # Context lungo con 64GB RAM
    
    # CPU Configuration (no GPU)
    USE_GPU = False
    CPU_THREADS = 24                         # Tutti i core disponibili
    CPU_ONLY = True
    
    # Model Preferences (in ordine di velocità)
    FAST_MODEL = "magicoder:7b-s-cl"         # Risposte rapide
    BALANCED_MODEL = "deepseek-coder:6.7b"   # Bilanciato
    QUALITY_MODEL = "codellama:13b-instruct" # Massima qualità
    
    # GitLab Projects Sync
    SYNC_ENABLED = True
    SYNC_INTERVAL = 300                      # 5 minuti
    AUTO_DOCUMENTATION = True
    
    # Logging
    LOG_LEVEL = "INFO"
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
class ProductionConfig(Config):
    DEBUG = False
    LOG_LEVEL = "INFO"
    
class DevelopmentConfig(Config):
    DEBUG = True
    LOG_LEVEL = "DEBUG"
    REQUEST_TIMEOUT = 60                     # Timeout ridotti per debug

# Auto-detect environment
def get_config():
    env = os.getenv('FLASK_ENV', 'production')
    if env == 'development':
        return DevelopmentConfig()
    return ProductionConfig()

# Configurazione specifica DFFM
class DFFMConfig(Config):
    # Progetti GitLab mappati
    GITLAB_PROJECTS = {
        4: {
            "name": "docs",
            "description": "Main documentation repository",
            "auto_sync": True,
            "folders": {
                "docs/Omron": "omron",
                "docs/Rockwell": "rockwell", 
                "docs/Ai": "meta",
                "docs/HyperV": "infrastructure"
            }
        }
    }
    
    # Modelli specializzati per tipo contenuto
    CONTENT_MODELS = {
        "omron": "codellama:13b-instruct",      # SysmacStudio ST/Ladder
        "rockwell": "deepseek-coder:6.7b",      # Optix/DotNet/TecnoPack
        "infrastructure": "mistral:7b-instruct", # HyperV/Docusaurus
        "meta": "magicoder:7b-s-cl"             # AI documentation
    }
