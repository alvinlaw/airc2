# airc2

## Usage

### Init a project

Go to your project folder with terminal and type :
 
```
airc2 init
```

This will create a `config.json` file in your project root. Edit and change the settings for your project.

### Compile actionscript to swf

```
airc2 build
```

### Launch SDK simulator

Just pass the simulator profile name as first argument.

Ex : launch the Air simulator with the default iphone screen size 
```
airc2 test [iPhone5Retina|iPhone|iPhone6|iPhone6plus]
```

### Package swf into ipa or apk

```
airc2/bin/airc2 package --build [debug|release] [ios|andoird]
```
