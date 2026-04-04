import Capacitor

class MyBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        print("🍎 BRIDGE LOADED - Registering AppleAuth")
        bridge?.registerPluginType(AppleAuthPlugin.self)
        print("🍎 AppleAuth registered")
    }
}
