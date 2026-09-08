// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "EliteCore",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "EliteCore", targets: ["EliteCore"]),
    ],
    targets: [
        .target(name: "EliteCore", path: "Sources/EliteCore"),
    ]
)
