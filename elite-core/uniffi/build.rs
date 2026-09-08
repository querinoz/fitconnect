fn main() {
    uniffi::generate_scaffolding("src/elite_core.udl").expect("generate UniFFI scaffolding");
}
