#!/bin/bash
set -e

echo "🔧 Setting up environment for homebridge-tuya-garage..."

# Check if python3 and pip3 are installed
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3 is not installed. Please install it first."
  exit 1
fi

if ! command -v pip3 &> /dev/null; then
  echo "❌ pip3 is not installed. Try: sudo apt install python3-pip"
  exit 1
fi

# Create a virtual environment
ENV_PATH="./tuya-env"
if [ ! -d "$ENV_PATH" ]; then
  echo "📁 Creating virtual environment at $ENV_PATH"
  python3 -m venv "$ENV_PATH"
else
  echo "📁 Virtual environment already exists at $ENV_PATH"
fi

# Activate and install tinytuya
echo "📦 Installing tinytuya in virtualenv..."
"$ENV_PATH/bin/pip" install --upgrade pip
"$ENV_PATH/bin/pip" install --upgrade tinytuya

# Show Python path
echo ""
echo "✅ Virtual environment ready."
echo "👉 Use this Python path in your plugin code:"
echo "    $ENV_PATH/bin/python"
echo ""
echo "📌 Reminder: update index.js to use this python path when calling Python scripts."
