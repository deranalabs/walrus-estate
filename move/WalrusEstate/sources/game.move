module walrus_estate::game {

    use sui::coin::{Coin, value, split};
    use sui::sui::SUI;

    /// A single node (tile) on the game board.
    public struct GameNode has copy, store {
        id: u8,
        price: u64,
        rent: u64,
        owner: address,
    }

    /// Main game state shared on-chain.
    public struct GameState has key {
        id: sui::object::UID,
        nodes: vector<GameNode>,
        admin: address,
    }

    /// Initialize shared game state with a small set of nodes.
    /// This should be called once by the admin after deploying the package.
    public fun init_state(admin: address, ctx: &mut sui::tx_context::TxContext) {
        let nodes = vector[
            // START tile – owned by the admin as the system account.
            GameNode { id: 0, price: 0, rent: 0, owner: admin },
            // Example node that can be purchased by a player.
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

        // Use node_id directly as the index into the nodes vector.
        let idx = node_id as u64;
        let node_ref = &mut state.nodes[idx];

        // Ensure the node is not already owned.
        assert!(node_ref.owner == @0x0, 1);

        let price = node_ref.price;

        // Create a local binding for use with `split`.
        let payment = payment;
        let paid = value<SUI>(&payment);

        // Ensure the payment amount is at least the node price.
        assert!(paid >= price, 2);

        // Transfer ownership of the node to the buyer.
        node_ref.owner = buyer;

        // If the buyer overpays, return the excess as change.
        if (paid > price) {
            let change = split<SUI>(&mut payment, paid - price, ctx);
            sui::transfer::public_transfer(change, buyer);
        };

        // Send the payment to the admin as a simple treasury.
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