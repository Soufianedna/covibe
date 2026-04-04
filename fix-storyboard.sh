#!/bin/bash
sed -i '' 's/customClass="CAPBridgeViewController" customModule="Capacitor"/customClass="MyBridgeViewController" customModule="App"/g' /Users/souf/Downloads/files/ios/App/App/Base.lproj/Main.storyboard
echo "✅ Storyboard fixed"
