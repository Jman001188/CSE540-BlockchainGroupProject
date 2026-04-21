// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

/*
    Honest Harvest - SupplyChainContract

    Purpose:
    Tracks batches on-chain using only essential verification data.

    Stored on-chain:
    - unique item ID
    - current owner address (company wallet)
    - hash of off-chain batch metadata
    - existence flag

    Stored off-chain:
    - batch name
    - batch description
    - registering company/user IDs
    - transfer workflow records
    - transaction status
    - any files, documents, images, certificates
*/

contract SupplyChainContract {
    struct Item {
        uint256 itemID;
        address owner;
        bytes32 dataHash;
        bool exists;
    }

    uint256 public currentID = 1;

    mapping(uint256 => Item) private items;

    event ItemRegistered(
        uint256 indexed itemID,
        address indexed owner,
        bytes32 dataHash
    );

    event OwnershipTransferred(
        uint256 indexed itemID,
        address indexed from,
        address indexed to
    );

    modifier itemExists(uint256 itemID) {
        require(items[itemID].exists, "Item does not exist");
        _;
    }

    modifier onlyOwner(uint256 itemID) {
        require(items[itemID].owner == msg.sender, "Caller is not the current owner");
        _;
    }

    /*
        Register a new batch/item.

        Intended workflow:
        - backend validates authenticated user/company
        - backend computes dataHash from off-chain metadata
        - transaction is signed by the company wallet (or via HSM on its behalf)
        - msg.sender becomes the recorded on-chain owner

        Inputs:
        - dataHash: hash of off-chain batch metadata

        Returns:
        - newly assigned blockchain itemID
    */
    function registerItem(bytes32 dataHash) external returns (uint256) {
        require(dataHash != bytes32(0), "dataHash cannot be empty");

        uint256 newID = currentID;

        items[newID] = Item({
            itemID: newID,
            owner: msg.sender,
            dataHash: dataHash,
            exists: true
        });

        emit ItemRegistered(newID, msg.sender, dataHash);

        currentID++;
        return newID;
    }

    /*
        Transfer ownership of an existing item to another company wallet.

        Intended workflow:
        - backend verifies transfer record is pending and receiver is authorized
        - backend initiates blockchain transaction
        - current owner wallet signs the transaction (or HSM signs on its behalf)

        Inputs:
        - itemID: blockchain item identifier
        - newOwner: destination company wallet address
    */
    function transferOwnership(
        uint256 itemID,
        address newOwner
    ) external itemExists(itemID) onlyOwner(itemID) {
        require(newOwner != address(0), "Invalid new owner address");
        require(newOwner != items[itemID].owner, "New owner must be different");

        address previousOwner = items[itemID].owner;
        items[itemID].owner = newOwner;

        emit OwnershipTransferred(itemID, previousOwner, newOwner);
    }

    /*
        Retrieve the on-chain record for a batch.
    */
    function getItem(
        uint256 itemID
    )
        external
        view
        itemExists(itemID)
        returns (
            uint256 returnedItemID,
            address owner,
            bytes32 dataHash
        )
    {
        Item memory item = items[itemID];
        return (item.itemID, item.owner, item.dataHash);
    }

    /*
        Convenience getter for current owner.
    */
    function getItemOwner(
        uint256 itemID
    ) external view itemExists(itemID) returns (address) {
        return items[itemID].owner;
    }

    /*
        Convenience getter for current data hash.
    */
    function getItemDataHash(
        uint256 itemID
    ) external view itemExists(itemID) returns (bytes32) {
        return items[itemID].dataHash;
    }

    /*
        Convenience checker for existence.
    */
    function itemExistsOnChain(uint256 itemID) external view returns (bool) {
        return items[itemID].exists;
    }
}