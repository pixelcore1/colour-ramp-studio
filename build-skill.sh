#!/usr/bin/env bash
# Repackages skills/figma-colour-ramps into the installable figma-colour-ramps.skill
# archive in the repository root. Run it after changing SKILL.md or the HTML.
set -euo pipefail
cd "$(dirname "$0")"
rm -f figma-colour-ramps.skill
( cd skills && zip -qr ../figma-colour-ramps.skill figma-colour-ramps )
echo "built figma-colour-ramps.skill"
unzip -l figma-colour-ramps.skill
