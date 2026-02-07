#!/bin/bash
cd ~/ai3lab-cockpit
export TMPDIR=$PREFIX/tmp
echo "=== Building ==="
node node_modules/vite/bin/vite.js build 2>&1
echo "=== Build exit: $? ==="
echo "=== Restarting server ==="
kill $(lsof -ti:5173) 2>/dev/null
sleep 1
nohup node serve.cjs > serve.log 2>&1 &
sleep 2
echo "=== Server PID: $! ==="
curl -s -o /dev/null -w "HTTP status: %{http_code}\n" http://localhost:5173
echo "=== Done ==="
