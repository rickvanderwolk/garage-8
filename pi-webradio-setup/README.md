# Pi 5 Webradio Setup (Icecast + ezstream)

## 1. Install Icecast

```bash
sudo apt update
sudo apt install icecast2 -y
```
During installation, choose "yes" to configure and set a source password.

## 2. Start Icecast

```bash
sudo systemctl start icecast2
sudo systemctl enable icecast2
```
Starts the streaming server on port 8000.

## 3. Verify Icecast is running

```bash
curl http://localhost:8000
```
Should return HTML with "Icecast Streaming Media Server".

## 4. Install ezstream and ffmpeg

```bash
sudo apt install ezstream ffmpeg -y
```
ezstream sends audio to Icecast, ffmpeg generates/processes audio.

## 5. Check your Icecast source password

```bash
grep source-password /etc/icecast2/icecast.xml
```
Note this password for the next step.

## 6. Create ezstream config

```bash
nano ~/ezstream.xml
```

Paste this (replace `hackme` with your actual password):

```xml
<ezstream>
    <servers>
        <server>
            <hostname>localhost</hostname>
            <port>8000</port>
            <password>hackme</password>
        </server>
    </servers>
    <streams>
        <stream>
            <mountpoint>/test</mountpoint>
            <format>MP3</format>
        </stream>
    </streams>
    <intakes>
        <intake>
            <filename>stdin</filename>
        </intake>
    </intakes>
</ezstream>
```

## 7. Start test stream (440Hz sine wave)

```bash
ffmpeg -f lavfi -i "sine=frequency=440" -ac 2 -ar 44100 -f mp3 - 2>/dev/null | ezstream -c ~/ezstream.xml
```
Generates a test tone and streams it to Icecast.

## 8. Listen

Open in VLC or browser:
```
http://<pi-ip>:8000/test
```

---

## Architecture

```
[ffmpeg] → [ezstream] → [Icecast :8000] → [Listeners]
 (source)   (encoder)     (server)         (VLC etc)
```

## Notes

- Liquidsoap segfaults on Pi 5 / ARM64, use ezstream instead
- Default Icecast admin page: http://<pi-ip>:8000/admin/
- Config file: `/etc/icecast2/icecast.xml`
