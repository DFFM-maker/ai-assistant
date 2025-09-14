#!/usr/bin/env python3
import sys
sys.path.append('/opt/ai-assistant')

import requests
from config import get_config

def test_gitlab_sync():
    config = get_config()
    headers = {'Authorization': f'Bearer {config.GITLAB_TOKEN}'}
    
    # Get project files
    r = requests.get(f'{config.GITLAB_URL}/api/v4/projects/4/repository/tree', headers=headers)
    
    if r.status_code == 200:
        files = r.json()
        print(f"✅ Found {len(files)} files/folders in 'docs' project:")
        for file in files[:5]:
            print(f"  - {file['name']} ({file['type']})")
    else:
        print(f"❌ Error accessing project: {r.status_code}")

if __name__ == '__main__':
    test_gitlab_sync()
