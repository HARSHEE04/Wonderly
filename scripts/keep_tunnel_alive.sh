#!/bin/bash
# Keeps a localtunnel alive for the given local port, restarting it whenever
# it exits (this environment's tunnels have been dying every 1-3 minutes
# regardless of network health). Appends each new public URL, timestamped,
# to the given log file so the latest one can be read at any time.
PORT="$1"
LOG="$2"

while true; do
  echo "$(date '+%Y-%m-%d %H:%M:%S') restarting tunnel for port $PORT" >> "$LOG"
  npx --yes localtunnel --port "$PORT" 2>&1 | while IFS= read -r line; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') $line" >> "$LOG"
  done
  sleep 1
done
