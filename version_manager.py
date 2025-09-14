#!/usr/bin/env python3
import os
import json
import hashlib
import shutil
from datetime import datetime
from typing import Dict, List, Optional
import subprocess

class AIVersionManager:
    def __init__(self, workspace_dir="/opt/ai-assistant/workspace"):
        self.workspace = workspace_dir
        self.projects_dir = os.path.join(workspace_dir, "projects")
        os.makedirs(self.projects_dir, exist_ok=True)
    
    def create_project(self, project_name: str, description: str = ""):
        """Crea nuovo progetto con versioning"""
        project_path = os.path.join(self.projects_dir, project_name)
        
        if os.path.exists(project_path):
            return {"error": f"Progetto {project_name} già esistente"}
        
        # Struttura progetto
        dirs = ["versions", "current", "docs", "exports"]
        for dir_name in dirs:
            os.makedirs(os.path.join(project_path, dir_name), exist_ok=True)
        
        # Metadata iniziali
        metadata = {
            "name": project_name,
            "description": description,
            "created": datetime.now().isoformat(),
            "current_version": "v1.0.0",
            "versions": [],
            "tags": [],
            "last_modified": datetime.now().isoformat()
        }
        
        with open(os.path.join(project_path, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
        
        return {"success": f"Progetto {project_name} creato"}
    
    def save_version(self, project_name: str, files: Dict[str, str], 
                    commit_message: str, version_tag: str = None):
        """Salva nuova versione del progetto"""
        project_path = os.path.join(self.projects_dir, project_name)
        
        if not os.path.exists(project_path):
            return {"error": f"Progetto {project_name} non trovato"}
        
        # Genera hash per identificare cambiamenti
        content_hash = self._generate_content_hash(files)
        timestamp = datetime.now().isoformat()
        
        if not version_tag:
            version_tag = self._auto_increment_version(project_name)
        
        # Salva files correnti
        current_dir = os.path.join(project_path, "current")
        for filename, content in files.items():
            file_path = os.path.join(current_dir, filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w", encoding='utf-8') as f:
                f.write(content)
        
        # Archivia versione
        version_dir = os.path.join(project_path, "versions", version_tag)
        if os.path.exists(version_dir):
            shutil.rmtree(version_dir)
        shutil.copytree(current_dir, version_dir)
        
        # Aggiorna metadata
        version_info = {
            "version": version_tag,
            "timestamp": timestamp,
            "hash": content_hash,
            "commit_message": commit_message,
            "files": list(files.keys())
        }
        
        self._update_project_metadata(project_name, version_info)
        
        return {
            "success": f"Versione {version_tag} salvata",
            "hash": content_hash,
            "version": version_tag
        }
    
    def get_version_history(self, project_name: str):
        """Ottieni cronologia versioni"""
        metadata = self._load_project_metadata(project_name)
        return metadata.get('versions', [])
    
    def get_version_diff(self, project_name: str, version_a: str, version_b: str):
        """Confronta due versioni"""
        project_path = os.path.join(self.projects_dir, project_name)
        
        version_a_path = os.path.join(project_path, "versions", version_a)
        version_b_path = os.path.join(project_path, "versions", version_b)
        
        if not all(os.path.exists(p) for p in [version_a_path, version_b_path]):
            return {"error": "Una o entrambe le versioni non esistono"}
        
        diff_result = {
            "added": [],
            "modified": [],
            "deleted": [],
            "changes": {}
        }
        
        files_a = self._get_files_in_dir(version_a_path)
        files_b = self._get_files_in_dir(version_b_path)
        
        # Analizza differenze
        for file in files_b:
            if file not in files_a:
                diff_result["added"].append(file)
            else:
                with open(os.path.join(version_a_path, file), 'r', encoding='utf-8') as f:
                    content_a = f.read()
                with open(os.path.join(version_b_path, file), 'r', encoding='utf-8') as f:
                    content_b = f.read()
                
                if content_a != content_b:
                    diff_result["modified"].append(file)
                    diff_result["changes"][file] = {
                        "lines_added": len(content_b.splitlines()) - len(content_a.splitlines()),
                        "chars_changed": abs(len(content_b) - len(content_a))
                    }
        
        for file in files_a:
            if file not in files_b:
                diff_result["deleted"].append(file)
        
        return diff_result
    
    def restore_version(self, project_name: str, version_tag: str):
        """Ripristina una versione specifica"""
        project_path = os.path.join(self.projects_dir, project_name)
        version_path = os.path.join(project_path, "versions", version_tag)
        current_path = os.path.join(project_path, "current")
        
        if not os.path.exists(version_path):
            return {"error": f"Versione {version_tag} non trovata"}
        
        # Backup current
        backup_path = os.path.join(project_path, "versions", f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        if os.path.exists(current_path):
            shutil.copytree(current_path, backup_path)
            shutil.rmtree(current_path)
        
        # Ripristina versione
        shutil.copytree(version_path, current_path)
        
        return {"success": f"Versione {version_tag} ripristinata"}
    
    def _generate_content_hash(self, files: Dict[str, str]) -> str:
        content = "".join(f"{k}:{v}" for k, v in sorted(files.items()))
        return hashlib.md5(content.encode()).hexdigest()[:8]
    
    def _auto_increment_version(self, project_name: str) -> str:
        metadata = self._load_project_metadata(project_name)
        current = metadata.get("current_version", "v1.0.0")
        
        parts = current.replace('v', '').split('.')
        if len(parts) == 3:
            patch = int(parts[2]) + 1
            return f"v{parts[0]}.{parts[1]}.{patch}"
        return "v1.0.1"
    
    def _update_project_metadata(self, project_name: str, version_info: dict):
        project_path = os.path.join(self.projects_dir, project_name)
        metadata_file = os.path.join(project_path, "metadata.json")
        
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        
        metadata["versions"].append(version_info)
        metadata["current_version"] = version_info["version"]
        metadata["last_modified"] = version_info["timestamp"]
        
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def _load_project_metadata(self, project_name: str) -> dict:
        metadata_file = os.path.join(self.projects_dir, project_name, "metadata.json")
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                return json.load(f)
        return {}
    
    def _get_files_in_dir(self, directory: str) -> List[str]:
        files = []
        for root, _, filenames in os.walk(directory):
            for filename in filenames:
                rel_path = os.path.relpath(os.path.join(root, filename), directory)
                files.append(rel_path)
        return files
