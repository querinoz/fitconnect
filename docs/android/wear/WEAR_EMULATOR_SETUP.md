# Emulator setup

SDK typical path: `%LOCALAPPDATA%\Android\Sdk`

## Phone

AVD `fitconnect_phone` (existing). Start:

```
emulator -avd fitconnect_phone
```

## Wear

Create only if a Wear system image is installed, for example:

```
sdkmanager "system-images;android-34;android-wear;x86_64"
avdmanager create avd -n fitconnect_wear -k "system-images;android-34;android-wear;x86_64" -d "wearos_small_round"
emulator -avd fitconnect_wear -port 5600
```

Official pairing: Android Studio Device Manager → pair Wear emulator with phone emulator. CLI pairing without the Wear OS companion app on the phone image is often **UNAVAILABLE**.

If image install fails (licenses, disk, hypervisor): `WEAR_EMULATOR = UNAVAILABLE`. Do not invent screenshots.

## GPS simulation (phone)

```
adb emu geo fix -9.1393 38.7223
```

Label results `GPS.EMULATOR` / `TEST_FIXTURE`, never LIVE.

## HR simulation

No standard AVD heart-rate sensor. Use `QaGpsRoute.HR_FIXTURE_BPM` in unit tests only. `SENSOR = UNAVAILABLE` on emulator.
