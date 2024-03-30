# SaveSentry

## Description
Ever had a game that is limited to only one save file, and that save file gets corrupted and immediately backed up by Steam? Yeah, me too (thanks, Dragon's Dogma 2!)
That's why I set out to create `SaveScum`, a program which you can configure to watch your save file directories. When a change has been detected by `SaveScum`, the save is automatically backed up in a seperate location. The amount of backups is configurable for each game that you which to backup. 

Did your save file get corrupted? Whelp, that sucks. But fret not: just quit the game, restore your save from `SaveScum`, load up, and game on!

## TODO
- [x] Add system to calculate hash of save folder to avoid unneeded duplicated saves
- [ ] Visual config editor
- [ ] Use GUI to restore save files
- [ ] Better UI
- [x] (Stretch) able to run `SaveScum` in the background without showing a window

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
