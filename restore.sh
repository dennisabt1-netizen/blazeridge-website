#!/usr/bin/env bash
# Stellt BlazeRidge-Webdesign-Skills, Agenten und Graphify in einer neuen Claude-Code-Sitzung wieder her.
# Aufruf (im Website-Repo):  bash <(git show origin/skills:restore.sh)
set -e
REPO=$(git rev-parse --show-toplevel)
git -C "$REPO" fetch -q origin skills
TMP=$(mktemp -d)
git -C "$REPO" archive origin/skills | tar -x -C "$TMP"
mkdir -p ~/.claude/skills ~/.claude/agents
cp -r "$TMP"/skills/* ~/.claude/skills/
cp "$TMP"/agents/*.md ~/.claude/agents/
# Graphify (Apache-2.0) – Wissensgraph fürs Repo, spart Tokens
if [ ! -x ~/.graphify-venv/bin/graphify ]; then
  python3 -m venv ~/.graphify-venv && ~/.graphify-venv/bin/pip install -q graphifyy
fi
~/.graphify-venv/bin/graphify install --platform claude >/dev/null 2>&1 || true
grep -q '^graphify-out/' "$REPO/.git/info/exclude" 2>/dev/null || echo 'graphify-out/' >> "$REPO/.git/info/exclude"
(cd "$REPO" && ~/.graphify-venv/bin/graphify update . >/dev/null 2>&1) || true
rm -rf "$TMP"
echo "skills: $(ls ~/.claude/skills | tr '\n' ' ')"
echo "agents: $(ls ~/.claude/agents | tr '\n' ' ')"
echo "Hinweis: neue Agenten sind erst nach Neustart der Sitzung als subagent_type verfügbar."
