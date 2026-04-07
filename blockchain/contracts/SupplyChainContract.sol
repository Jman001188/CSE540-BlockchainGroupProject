// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

/*
    SupplyChainContract

    Purpose:
    This contract tracks item batches in a supply chain.

    What is stored on-chain:
    - unique item ID
    - current owner address
    - hash of item metadata
    - hash of any associated file
    - whether the item exists

    What is handled off-chain:
    - human-readable item name
    - source item descriptions
    - documents / images / certificates
    - database records and UI display details

    Events are emitted so an off-chain system can listen and store/display
    descriptive information without forcing large strings or files on-chain.
*/

contract SupplyChainContract {

    // Represents a tracked batch/item in the supply chain
    struct Item {
        uint256 id;
        address owner;
        bytes32 dataHash;
        bytes32 fileHash;
        bool exists;
    }

    // Next ID to assign to a newly registered item
    uint256 public currentID = 1;

    // Mapping from item ID to item data
    mapping(uint256 => Item) private items;

    /*
        Event emitted when a new item is registered.

        itemID: newly created item ID
        owner: address of the creator / initial owner
        name: off-chain human-readable batch/item name
        sourceItemIDs: IDs of source items used to create this batch
        dataHash: hash of metadata stored off-chain
        fileHash: hash of attached file stored off-chain
    */
    event ItemRegistered(
        uint256 indexed itemID,
        address indexed owner,
        string name,
        uint256[] sourceItemIDs,
        bytes32 dataHash,
        bytes32 fileHash
    );

    /*
        Event emitted when ownership of an item is transferred.
    */
    event ItemTransferred(
        uint256 indexed itemID,
        address indexed from,
        address indexed to
    );

    // Ensures that the item exists before continuing
    modifier itemExists(uint256 itemID) {
        require(items[itemID].exists, "Item does not exist");
        _;
    }

    // Ensures that only the current owner can perform certain actions
    modifier onlyOwner(uint256 itemID) {
        require(items[itemID].owner == msg.sender, "Caller is not the item owner");
        _;
    }

    /*
        Register a new item in the supply chain.

        Parameters:
        - name: human-readable name for the item/batch
        - sourceItemIDs: IDs of input/source items; empty for raw/origin material
        - dataHash: hash of metadata stored off-chain
        - fileHash: hash of related file stored off-chain

        Returns:
        - newly assigned item ID
    */
    function registerItem(
        string calldata name,
        uint256[] calldata sourceItemIDs,
        bytes32 dataHash,
        bytes32 fileHash
    ) external returns (uint256) {
        uint256 newID = currentID;

        items[newID] = Item({
            id: newID,
            owner: msg.sender,
            dataHash: dataHash,
            fileHash: fileHash,
            exists: true
        });

        emit ItemRegistered(
            newID,
            msg.sender,
            name,
            sourceItemIDs,
            dataHash,
            fileHash
        );

        currentID++;
        return newID;
    }

    /*
        Transfer an item to another address.

        Requirements:
        - item must exist
        - caller must be current owner
        - recipient cannot be the zero address
    */
    function transferItem(
        uint256 itemID,
        address newOwner
    ) external itemExists(itemID) onlyOwner(itemID) {
        require(newOwner != address(0), "Invalid recipient address");
        require(newOwner != items[itemID].owner, "New owner must be different");

        address previousOwner = items[itemID].owner;
        items[itemID].owner = newOwner;

        emit ItemTransferred(itemID, previousOwner, newOwner);
    }

    /*
        Read the on-chain data for a specific item.

        This is useful because the mapping is private, so we expose
        a clean getter function for item details.
    */
    function getItem(uint256 itemID)
        external
        view
        itemExists(itemID)
        returns (
            uint256 id,
            address owner,
            bytes32 dataHash,
            bytes32 fileHash,
            bool exists
        )
    {
        Item memory item = items[itemID];
        return (
            item.id,
            item.owner,
            item.dataHash,
            item.fileHash,
            item.exists
        );
    }

    /*
        Convenience function to check the current owner of an item.
    */
    function getItemOwner(uint256 itemID)
        external
        view
        itemExists(itemID)
        returns (address)
    {
        return items[itemID].owner;
    }
}