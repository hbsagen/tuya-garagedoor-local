# homebridge-tuya-garage

A Homebridge accessory plugin that allows you to control a Tuya-based garage door using local commands over your network – no cloud required.

---

## 🚀 Features

- Local-only control using Python and `tinytuya`
- Full HomeKit compatibility
- Supports `OPEN`, `CLOSE`, and `status polling`
- Automatically updates HomeKit state

---

## 🔧 Requirements

- Homebridge installed
- Python 3 with `pip3`
- Your Tuya device's `deviceId`, `IP`, and `localKey`

---

## 📆 Installation

### 1. Clone this repository:
```bash
git clone https://github.com/hbsagen/tuya-garagedoor-local.git
cd homebridge-tuya-garage
```

### 2. Run the setup script:
```bash
chmod +x install.sh
./install.sh
```

This will install Python dependencies (like `tinytuya`) and verify your setup.

---

## 🛠 Configuration

Add the following to the `accessories` section of your Homebridge `config.json`:

```json
{
  "accessory": "TuyaGarage",
  "name": "Garasjeport",
  "deviceId": "your-device-id",
  "ip": "your-device-ip",
  "localKey": "your-local-key"
}
```

To get the `deviceId`, `ip`, and `localKey`, run:

```bash
pip3 install tinytuya
tinytuya wizard
```

Login with your Tuya credentials and follow the prompts.

---

## 🧪 Example Setup

In your Homebridge config:

```json
"accessories": [
  {
    "accessory": "TuyaGarage",
    "name": "Door",
    "deviceId": "yyyyyyyyyyyyyyyyyyyyy",
    "ip": "192.168.1.23",
    "localKey": "xxxxxxxxxxxx"
  }
]
```

---

## 🧰 Troubleshooting

### ❌ `"Network Error: Unable to Connect"`
- Make sure the IP address is correct
- Reboot the Tuya device
- Avoid Tuya Smart Cloud binding

### ❗ `"Unexpected Payload from Device"`
- Ensure the protocol version is correct (this plugin uses version 3.4)

---

## 💡 Tips

- You can manually test your Tuya device:
```python
import tinytuya
d = tinytuya.Device("deviceId", "ip", "localKey")
d.set_version(3.4)
print(d.status())
```

- Add `polling_interval` to adjust how often the device is queried (default is 10s)
- Status `dps 104` is used to determine if the garage door is open (100) or closed (0)

---

## 📜 License

MIT © Henning B. Sagen

