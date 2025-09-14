#!/usr/bin/env python3
from flask import Flask, render_template, request, jsonify
import requests
import os
import sys
sys.path.append('/opt/ai-assistant')
from config import get_config
from version_manager import AIVersionManager

app = Flask(__name__)
config = get_config()
version_manager = AIVersionManager()

@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/health')
def health():
    return jsonify({"status": "OK", "cpu_threads": config.CPU_THREADS})

@app.route('/api/models')
def list_models():
    try:
        r = requests.get(f'{config.OLLAMA_URL}/api/tags', timeout=5)
        return jsonify(r.json())
    except:
        return jsonify({"error": "Ollama not available"}), 500

@app.route('/api/generate', methods=['POST'])
def generate_ai():
    data = request.json
    prompt = data.get('prompt', '')
    model = data.get('model', config.DEFAULT_MODEL)
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        r = requests.post(f'{config.OLLAMA_URL}/api/generate', json=payload, timeout=300)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Versioning API endpoints
@app.route('/api/projects')
def list_projects():
    """Lista progetti con versioning"""
    try:
        projects = []
        projects_dir = version_manager.projects_dir
        
        if os.path.exists(projects_dir):
            for project in os.listdir(projects_dir):
                metadata_path = os.path.join(projects_dir, project, "metadata.json")
                if os.path.exists(metadata_path):
                    metadata = version_manager._load_project_metadata(project)
                    projects.append(metadata)
        
        return jsonify({"projects": projects})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Crea nuovo progetto"""
    data = request.json
    name = data.get('name', '')
    description = data.get('description', '')
    
    result = version_manager.create_project(name, description)
    return jsonify(result)

@app.route('/api/projects/<project_name>/save', methods=['POST'])
def save_version(project_name):
    """Salva nuova versione"""
    data = request.json
    files = data.get('files', {})
    message = data.get('message', 'Auto-save from AI Assistant')
    version_tag = data.get('version_tag')
    
    result = version_manager.save_version(project_name, files, message, version_tag)
    return jsonify(result)

@app.route('/api/projects/<project_name>/versions')
def get_versions(project_name):
    """Ottieni cronologia versioni"""
    try:
        versions = version_manager.get_version_history(project_name)
        return jsonify({"versions": versions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<project_name>/diff/<version_a>/<version_b>')
def get_diff(project_name, version_a, version_b):
    """Confronta due versioni"""
    try:
        diff = version_manager.get_version_diff(project_name, version_a, version_b)
        return jsonify(diff)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<project_name>/restore/<version_tag>', methods=['POST'])
def restore_version(project_name, version_tag):
    """Ripristina versione specifica"""
    try:
        result = version_manager.restore_version(project_name, version_tag)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
