# Tiny midi adapter for hydra.ojack.xyz

## How to use it

To load the script
```
await loadScript("https://midi-mapper-six.vercel.app/midi.umd.cjs")
```

setup smoothing for notes in seconds, it's the time to smooth notes from 0 to 1 and 0
```
$midi.setSmoothTime(0.01)
```

get control value
```
$midi.get(XX)
```

get note value
```
$midi.getNote(XX)
```