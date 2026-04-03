import Capacitor

class MyBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginType(AppleAuthPlugin.self)
    }
}
