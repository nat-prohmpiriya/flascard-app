#!/bin/bash
API="http://localhost:3005/api/data/flashcard"
KEY="flashcard-import-secret-2024"
USER="u93az0mZePetX3EW5kyhiX8ZQfN2"

# Delete decks
DECK_IDS=(
  OEwOAQecdlysi0OX003V
  teZ5uth6sIj2t52LFNZr
  VC8gYWaCIg0wWBgM49ic
  8H1kZnLjeBAe77B40pTV
  Yjs8Eb4xq6m9XRX9ZR5b
  2RwWvdRsZ3sJ07WaSi6k
  IpVIHwrOpYLyqjfHHYuB
  0c1Vq0VJLfGiIwj9D7fQ
  ZL4jttkFGYn8d2oqZoCe
  z3DGo7HJsZHQi7XO9Y0l
  CwjekQOp9LyNuGouXfzi
  YDtEkACDrTagjdBGXbfy
  wgzNIFpiljMSNYRvS9IJ
  0K0hXwYq1Wq3YOcFlK1b
  bD7aS7aMrVvwwaHs80fE
  DYhWuk7wcFvIzVdlZyH4
)

echo "=== Deleting decks ==="
for id in "${DECK_IDS[@]}"; do
  result=$(curl -s -X DELETE "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" -d "{\"userId\":\"$USER\",\"deckId\":\"$id\"}")
  name=$(echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('deleted',{}).get('deckName',''))" 2>/dev/null)
  echo "✓ Deleted: $name"
done

echo ""
echo "=== Importing decks ==="
FILES=(
  typescript-concepts.json
  svelte-concepts.json
  rust-concepts.json
  redis-concepts.json
  react-concepts.json
  python-concepts.json
  postgresql-concepts.json
  nextjs-concepts.json
  nestjs-concepts.json
  mongodb-concepts.json
  kubernetes-concepts.json
  javascript-concepts.json
  go-concepts.json
  docker-concepts.json
  aws-solutions-architect.json
  aws-developer-associate.json
)

for file in "${FILES[@]}"; do
  result=$(curl -s -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" -d "{\"userId\":\"$USER\",\"path\":\"flashcard/programming\",\"filename\":\"$file\"}")
  name=$(echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d.get('deck',{}).get('name','')} - {d.get('cardsImported',0)} cards\")" 2>/dev/null)
  echo "✓ Imported: $name"
done

echo ""
echo "Done!"
