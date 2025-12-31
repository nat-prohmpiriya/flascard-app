#!/usr/bin/env python3
"""
Script to shorten pronunciation fields in flashcard JSON files.
Keeps only the first line or first 150 characters of pronunciation.
"""

import json
import os
import re

def shorten_pronunciation(pronunciation):
    """Shorten pronunciation to first meaningful line or ~150 chars"""
    if not pronunciation:
        return pronunciation

    # Split by newlines and get first few meaningful lines
    lines = pronunciation.strip().split('\n')

    # Filter out comment-only lines and empty lines
    meaningful_lines = []
    for line in lines:
        stripped = line.strip()
        # Skip empty lines and pure comment lines
        if stripped and not stripped.startswith('//') and not stripped.startswith('#'):
            meaningful_lines.append(line)
        elif stripped.startswith('//') or stripped.startswith('#'):
            # Include comments if they're informative
            if len(stripped) > 5:
                meaningful_lines.append(line)

        # Stop after 3 meaningful lines or 150 chars
        current_text = '\n'.join(meaningful_lines)
        if len(meaningful_lines) >= 3 or len(current_text) > 150:
            break

    result = '\n'.join(meaningful_lines[:3])

    # Truncate if still too long
    if len(result) > 200:
        result = result[:200] + '...'

    return result

def process_file(filepath):
    """Process a single JSON file"""
    print(f"Processing: {os.path.basename(filepath)}")

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cards = data.get('cards', [])
    modified = 0

    for card in cards:
        old_pronunciation = card.get('pronunciation', '')
        if old_pronunciation and len(old_pronunciation) > 200:
            new_pronunciation = shorten_pronunciation(old_pronunciation)
            if new_pronunciation != old_pronunciation:
                card['pronunciation'] = new_pronunciation
                modified += 1

    if modified > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Modified {modified} cards")
    else:
        print(f"  No changes needed")

    return modified

def main():
    # Directory containing flashcard JSON files
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    programming_dir = os.path.join(base_dir, 'data', 'flashcard', 'programming')

    # Files to process
    files_to_process = [
        'go-concepts.json',
        'rust-concepts.json',
        'docker-concepts.json',
        'kubernetes-concepts.json',
        'postgresql-concepts.json',
        'mongodb-concepts.json',
        'redis-concepts.json',
        'aws-developer-associate.json',
    ]

    total_modified = 0

    for filename in files_to_process:
        filepath = os.path.join(programming_dir, filename)
        if os.path.exists(filepath):
            modified = process_file(filepath)
            total_modified += modified
        else:
            print(f"File not found: {filename}")

    print(f"\nTotal cards modified: {total_modified}")

if __name__ == '__main__':
    main()
