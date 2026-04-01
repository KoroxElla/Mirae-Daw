#!/usr/bin/env python3
import os
import re
import sys

def fix_conflict_markers(filepath):
    """Remove merge conflict markers, keeping the HEAD version"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file has conflicts
        if '<<<<<<< HEAD' not in content and '>>>>>>> ' not in content:
            return False
        
        print(f"Fixing: {filepath}")
        
        # Remove conflict markers and keep HEAD version
        lines = content.split('\n')
        new_lines = []
        in_conflict = False
        skip_until_end = False
        
        for line in lines:
            if line.startswith('<<<<<<< HEAD'):
                in_conflict = True
                continue
            elif line.startswith('======='):
                skip_until_end = True
                continue
            elif line.startswith('>>>>>>> ') and skip_until_end:
                in_conflict = False
                skip_until_end = False
                continue
            elif line.startswith('>>>>>>> '):
                in_conflict = False
                continue
            
            if not in_conflict and not skip_until_end:
                new_lines.append(line)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        
        return True
    except Exception as e:
        print(f"Error fixing {filepath}: {e}")
        return False

def main():
    extensions = ['.py', '.js', '.ts', '.tsx', '.json', '.css', '.html', '.txt']
    fixed_count = 0
    
    for root, dirs, files in os.walk('.'):
        # Skip .git directory
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                if fix_conflict_markers(filepath):
                    fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} files with merge conflicts")

if __name__ == '__main__':
    main()
