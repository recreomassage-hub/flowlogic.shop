#!/bin/bash
# Install aliases for Flow Logic project
# This script adds the .aliases file to your .bashrc or .zshrc

set -e

# Get project root directory (where this script is located)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALIASES_FILE="$PROJECT_ROOT/.aliases"

# Check if .aliases exists
if [ ! -f "$ALIASES_FILE" ]; then
    echo "❌ Error: .aliases file not found at $ALIASES_FILE"
    exit 1
fi

# Detect shell config file
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    # Try to detect from $SHELL
    case "$SHELL" in
        *zsh*)
            SHELL_CONFIG="$HOME/.zshrc"
            SHELL_NAME="zsh"
            ;;
        *)
            SHELL_CONFIG="$HOME/.bashrc"
            SHELL_NAME="bash"
            ;;
    esac
fi

# Check if config file exists, create if not
if [ ! -f "$SHELL_CONFIG" ]; then
    echo "📝 Creating $SHELL_CONFIG..."
    touch "$SHELL_CONFIG"
fi

# Check if already installed
SOURCE_LINE="source \"$ALIASES_FILE\""
if grep -qF "$SOURCE_LINE" "$SHELL_CONFIG" 2>/dev/null; then
    echo "✅ Aliases already installed in $SHELL_CONFIG"
    echo "💡 To use them in current session, run: source $ALIASES_FILE"
    exit 0
fi

# Add to config file
echo "" >> "$SHELL_CONFIG"
echo "# Flow Logic project aliases" >> "$SHELL_CONFIG"
echo "$SOURCE_LINE" >> "$SHELL_CONFIG"

echo "✅ Aliases installed successfully!"
echo ""
echo "📋 Added to $SHELL_CONFIG:"
echo "   $SOURCE_LINE"
echo ""
echo "💡 To use aliases in current session, run:"
echo "   source $ALIASES_FILE"
echo ""
echo "💡 Or restart your terminal / run:"
echo "   source $SHELL_CONFIG"
echo ""
echo "📖 Available aliases:"
echo "   - status-gen, status-read"
echo "   - issues, issues-active, issues-done"
echo "   - See .aliases or CHEATSHEET.md for full list"
echo ""
echo "💡 Note: Beads CLI commands (bd) should be used directly:"
echo "   - bd ready, bd start {id}, bd complete {id}"
echo "   - Install with: npm install -g @beads/bd@latest"


