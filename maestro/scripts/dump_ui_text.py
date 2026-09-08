import re
import subprocess
import sys

adb = subprocess.check_output(
    ["powershell", "-NoProfile", "-Command", "$env:LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe'"],
    text=True,
).strip()
serial = "emulator-5554"
subprocess.check_call([adb, "-s", serial, "shell", "uiautomator", "dump", "/sdcard/ui.xml"])
xml = subprocess.check_output([adb, "-s", serial, "shell", "cat", "/sdcard/ui.xml"], text=True, errors="replace")
seen = []
for m in re.finditer(r'(?:text|content-desc)="([^"]+)"', xml):
    t = m.group(1).strip()
    if t and t not in seen:
        seen.append(t)
        print(t)
