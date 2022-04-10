# MS-TEAMS Customizer

Tool for customizing the godawful and shitty M$-Teams

## THIS IS CURRENTLY IN PoC STATE

Currently this just enables the Debug menu from MS-Teams.  
Allowing you to use Chrome-Devtools and attaching a debugger.

## Installation

```bash
npm i -g msteams-customizer
```

## Usage

```bash
msteams-customizer --help
msteams-customizer COMMAND --help
```

### patch (with default settings)

```bash
msteams-customizer patch [PATH TO app.asar (without brackets)] -d
```

### restore

```bash
msteams-customizer restore [PATH TO app.asar (without brackets)]
```

### Experimental Style patch (PoC)

You can provide the option `--experimentalStylePatch` to enable a PoC patch,  
that re-styles the messages you've sent (Black instead of purple-ish)

```bash
msteams-customizer patch [PATH TO app.asar (without brackets)] -d --experimentalStylePatch 
```

## App.asar locations
 - *Windows*: C:\Users\<USERNAME>\AppData\Local\Microsoft\Teams\current\resources
 - *MacOs*: /Applications/Microsoft Teams.app/Contents/Resources/app.asar (?)
 - *Linux*: /usr/share/teams/resources/app.asar (?)
