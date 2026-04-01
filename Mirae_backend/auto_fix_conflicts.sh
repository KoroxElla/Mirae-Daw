#!/bin/bash

echo "🔍 Finding and fixing merge conflicts..."

# Function to fix a file
fix_file() {
    local file=$1
    echo "Fixing: $file"
    
    # Use sed to remove conflict markers and keep the HEAD version
    # This removes everything between <<<<<<< HEAD and =======, and >>>>>>> lines
    sed -i.tmp '
        /<<<<<<< HEAD/,/=======/ {
            /<<<<<<< HEAD/d
            /=======/d
        }
        />>>>>>> /d
    ' "$file"
    
    # Remove backup files
    rm -f "$file.tmp"
    
    echo "✅ Fixed: $file"
}

# Find all files with conflict markers
find . -type f \( -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.css" -o -name "*.html" -o -name "*.txt" \) | while read file; do
    if grep -q ">>>>>>> " "$file" 2>/dev/null || grep -q "<<<<<<< " "$file" 2>/dev/null; then
        fix_file "$file"
    fi
done

echo ""
echo "✅ All conflicts fixed!"
