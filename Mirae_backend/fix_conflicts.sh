#!/bin/bash

echo "Searching for merge conflict markers in Python files..."

# Find all Python files with conflict markers
find . -name "*.py" -type f | while read file; do
    if grep -l ">>>>>>> " "$file" 2>/dev/null || grep -l "<<<<<<< " "$file" 2>/dev/null || grep -l "=======" "$file" 2>/dev/null; then
        echo "❌ Conflict found in: $file"
        echo "   Lines with conflicts:"
        grep -n "<<<<<<< HEAD\|=======\|>>>>>>>" "$file" 2>/dev/null
        echo ""
    fi
done

echo ""
echo "Searching for merge conflict markers in all text files..."
find . -type f \( -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.css" -o -name "*.html" -o -name "*.txt" \) | while read file; do
    if grep -l ">>>>>>> " "$file" 2>/dev/null || grep -l "<<<<<<< " "$file" 2>/dev/null; then
        echo "❌ Conflict found in: $file"
    fi
done

echo ""
echo "Total files with conflicts:"
find . -type f -exec grep -l ">>>>>>> " {} \; 2>/dev/null | wc -l
