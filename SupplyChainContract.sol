// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract SupplyChainContract {
	
	// on-chain data sctructure contains the address of the oner entity, the hash of any data associated with it, 
	// and possibly the hash of any files associated with it... if needed.
	struct Item {
		address owner;
		bytes32 dataHash;
		bytes32 fileHash;
	}
	
	// Global counter for this contract. This will be 
	uint256 currentID = 1;
	
	// event that contains offchain information related to the name of the item batch, and the array of items it originated from.
	// If the array is empty, that means it's an originating material. This information will be emitted during a new item registration.
	event NewItemInformation(string, uint256[]);
	
	// Event that contains off-chain information related to the transfer of an item batch from one entity to another.
	// It will contain at the minimum, the item batch ID in order to identify the specified item, the fromEntity address, 
	// and toEntity address to identify the giving and receiving entities.
	event TransferItemInformation(uint32, address, address);
	

	// a map of all registered items in the contract
	mapping (uint32 => Item) items;
	
	// Inputs args that contain things like item name and the hash of its data
	function registerItem () {
		// Creates a new Item with the given information and appends it to the Contract's items map. 
		// Emits information for the off-chain database/s once complete via the NewItemInformation event
	}
	
	// Inputs args that contain things like item being transfered (by ID), the owner and recipient to create a transaction.
	function transferItem () {
		// Item's owner will be changed to the recipient. 
		// Off-chain information will be emitted via the TransferItemInformation event.
	}
	
}