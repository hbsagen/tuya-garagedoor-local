#!/bin/bash
set -e

echo "🔧 Installing dependencies for homebridge-tuya-garage..."

# Check for python3 and pip3
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3 is not installed. Please install Python 3 first."
  exit 1
fi

if ! command -v pip3 &> /dev/null; then
  echo "❌ pip3 is not installed. Please install pip3 for Python 3 first."
  exit 1
fi

# Install tinytuya
echo "📦 Installing/updating tinytuya..."
pip3 install --upgrade tinytuya

# Check if homebridge is installed
if ! command -v homebridge &> /dev/null; then
  echo "⚠️ Homebridge is not installed globally. Make sure it's installed with:"
  echo "    sudo npm install -g homebridge"
else
  echo "✅ Homebridge is installed."
fi

echo "✅ Setup complete. You can now configure the plugin in Homebridge UI or config.json."
