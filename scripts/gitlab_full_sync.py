#!/usr/bin/env python3
import sys
sys.path.append('/opt/ai-assistant')
import requests
import json
import os
from config import get_config

def sync_repository_content():
    config = get_config()
    headers = {'Authorization': f'Bearer {config.GITLAB_TOKEN}'}
    
    # Get all files from docs project recursively
    r = requests.get(f'{config.GITLAB_URL}/api/v4/projects/4/repository/tree?recursive=true&per_page=100', headers=headers)
    
    if r.status_code == 200:
        files = r.json()
        
        # Create local project structure
        project_dir = f'{config.PROJECTS_DIR}/docs'
        os.makedirs(project_dir, exist_ok=True)
        
        # Organize by folder type
        folders = {
            'omron': [f for f in files if 'Omron' in f['path']],
            'rockwell': [f for f in files if 'Rockwell' in f['path']],
            'ai': [f for f in files if 'Ai' in f['path']],
            'hyperv': [f for f in files if 'HyperV' in f['path']]
        }
        
        for folder_type, folder_files in folders.items():
            print(f"\n=== {folder_type.upper()} Files ({len(folder_files)}) ===")
            
            md_files = [f for f in folder_files if f['name'].endswith('.md')]
            other_files = [f for f in folder_files if not f['name'].endswith('.md')]
            
            print(f"Markdown files: {len(md_files)}")
            print(f"Other files: {len(other_files)}")
            
            # Download first 3 MD files for analysis
            for md_file in md_files[:3]:
                try:
                    file_r = requests.get(f'{config.GITLAB_URL}/api/v4/projects/4/repository/files/{md_file["path"].replace("/", "%2F")}?ref=main', headers=headers)
                    if file_r.status_code == 200:
                        file_content = file_r.json()
                        content = file_content['content']
                        # Save to local project
                        local_path = f'{project_dir}/{md_file["path"]}'
                        os.makedirs(os.path.dirname(local_path), exist_ok=True)
                        
                        # Decode base64 content
                        import base64
                        decoded_content = base64.b64decode(content).decode('utf-8')
                        
                        with open(local_path, 'w') as f:
                            f.write(decoded_content)
                        
                        print(f"  Downloaded: {md_file['name']} ({len(decoded_content)} chars)")
                except Exception as e:
                    print(f"  Error downloading {md_file['name']}: {e}")
        
        return True
    else:
        print(f"Error accessing repository: {r.status_code}")
        return False

if __name__ == '__main__':
    sync_repository_content()
