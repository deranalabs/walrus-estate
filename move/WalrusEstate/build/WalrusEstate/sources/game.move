module walrus_estate::game {

    use sui::coin::{Coin, value, split};
    use sui::sui::SUI;

    /// Satu node di board game.
    public struct GameNode has copy, store {
        id: u8,
        price: u64,
        rent: u64,
        owner: address,
    }

    /// State utama game yang dishare di chain.
    public struct GameState has key {
        id: sui::object::UID,
        nodes: vector<GameNode>,
        admin: address,
    }

    /// Initialize shared game state with a small set of nodes.
    /// Nanti cukup dipanggil sekali oleh admin setelah deploy package.
    public fun init_state(admin: address, ctx: &mut sui::tx_context::TxContext) {
        let nodes = vector[
            // START tile – dimiliki admin sebagai sistem
            GameNode { id: 0, price: 0, rent: 0, owner: admin },
            // Satu node contoh yang bisa dibeli pemain
            GameNode { id: 1, price: 10_000_000, rent: 1_000_000, owner: @0x0 },
        ];

        let state = GameState {
            id: sui::object::new(ctx),
            nodes,
            admin,
        };

        sui::transfer::share_object(state);
    }

    /// Buy a node by paying at least its price in SUI.
    public fun buy_node(
        state: &mut GameState,
        node_id: u8,
        payment: Coin<SUI>,
        ctx: &mut sui::tx_context::TxContext,
    ) {
        let buyer = sui::tx_context::sender(ctx);

        // gunakan node_id sebagai index vector secara langsung
        let idx = node_id as u64;
        let node_ref = &mut state.nodes[idx];

        // pastikan belum dimiliki
        assert!(node_ref.owner == @0x0, 1);

        let price = node_ref.price;

        // buat binding mutable untuk dipakai di split
        let mut payment = payment;
        let paid = value<SUI>(&payment);

        // pastikan cukup bayar
        assert!(paid >= price, 2);

        // set ownership ke pembeli
        node_ref.owner = buyer;

        // kalau bayar kelebihan, kembalikan change
        if (paid > price) {
            let change = split<SUI>(&mut payment, paid - price, ctx);
            sui::transfer::public_transfer(change, buyer);
        };

        // kirim payment ke admin (treasury sederhana)
        sui::transfer::public_transfer(payment, state.admin);
    }

    public fun log_roll(
        _state: &mut GameState,
        roll: u8,
        _ctx: &mut sui::tx_context::TxContext,
    ) {
        assert!(roll >= 1 && roll <= 6, 3);
    }
}