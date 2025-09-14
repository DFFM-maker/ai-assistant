#!/usr/bin/env python3
import sys
sys.path.append('/opt/ai-assistant')
import requests
import json
import os
from config import get_config

def analyze_project_content():
    config = get_config()
    
    # Find downloaded markdown files
    project_dir = f'{config.PROJECTS_DIR}/docs'
    
    if not os.path.exists(project_dir):
        print("No synced content found. Run gitlab_full_sync.py first.")
        return
    
    # Find all markdown files
    md_files = []
    for root, dirs, files in os.walk(project_dir):
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))
    
    print(f"Found {len(md_files)} markdown files to analyze")
    
    # Analyze with AI
    for md_file in md_files[:3]:  # Analyze first 3
        print(f"\n=== Analyzing {os.path.basename(md_file)} ===")
        
        with open(md_file, 'r') as f:
            content = f.read()
        
        # AI analysis prompt
        prompt = f"""Analyze this technical documentation and provide:
1. Main topic and purpose
2. Technical complexity level
3. Suggested improvements
4. Missing sections

Content:
{content[:1000]}...
"""
        
        payload = {
            "model": "deepseek-coder:6.7b",
            "prompt": prompt,
            "stream": False
        }
        
        try:
            r = requests.post(f'{config.OLLAMA_URL}/api/generate', json=payload, timeout=60)
            if r.status_code == 200:
                response = r.json()['response']
                print(response[:500] + "...")
            else:
                print("Error generating analysis")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == '__main__':
    analyze_project_content()
