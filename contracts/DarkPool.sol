// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract DarkPool is ZamaEthereumConfig {

    enum OrderStatus { PENDING, MATCHED, CANCELLED }
    enum OrderSide   { BUY, SELL }

    struct Order {
        address     owner;
        OrderSide   side;
        euint64     encPrice;
        euint64     encAmount;
        uint256     timestamp;
        OrderStatus status;
    }

    struct PendingMatch {
        uint256 buyId;
        uint256 sellId;
        bytes32 resultHandle; 
        bool    resolved;
    }

    uint256 public orderCount;
    uint256 public matchCount;

    mapping(uint256 => Order)        private orders;
    mapping(uint256 => PendingMatch) public  pendingMatches;

    uint256[] public pendingBuyIds;
    uint256[] public pendingSellIds;

    event OrderSubmitted(uint256 indexed orderId, address indexed owner, OrderSide side);
    event MatchRequested(uint256 indexed matchId, uint256 buyId, uint256 sellId, bytes32 resultHandle);
    event OrderMatched(uint256 indexed buyOrderId, uint256 indexed sellOrderId);

    // Submit Order 
    function submitOrder(
        OrderSide       side,
        externalEuint64 encPriceInput,
        externalEuint64 encAmountInput,
        bytes calldata  inputProof
    ) external returns (uint256 orderId) {
        orderId = ++orderCount;

        euint64 encPrice  = FHE.fromExternal(encPriceInput, inputProof);
        euint64 encAmount = FHE.fromExternal(encAmountInput, inputProof);

        orders[orderId] = Order({
            owner:     msg.sender,
            side:      side,
            encPrice:  encPrice,
            encAmount: encAmount,
            timestamp: block.timestamp,
            status:    OrderStatus.PENDING
        });

        FHE.allowThis(encPrice);
        FHE.allowThis(encAmount);
        FHE.allow(encPrice,  msg.sender);
        FHE.allow(encAmount, msg.sender);

        if (side == OrderSide.BUY) {
            pendingBuyIds.push(orderId);
        } else {
            pendingSellIds.push(orderId);
        }

        emit OrderSubmitted(orderId, msg.sender, side);
        _tryMatch();
    }

    //  Try to create a match request 
    function _tryMatch() internal {
        if (pendingBuyIds.length == 0 || pendingSellIds.length == 0) return;

        uint256 buyId  = pendingBuyIds[pendingBuyIds.length - 1];
        uint256 sellId = pendingSellIds[pendingSellIds.length - 1];

        Order storage buyOrder  = orders[buyId];
        Order storage sellOrder = orders[sellId];

        if (buyOrder.status  != OrderStatus.PENDING) return;
        if (sellOrder.status != OrderStatus.PENDING) return;

        // Encrypted comparison: buyPrice >= sellPrice
        ebool priceMatches = FHE.ge(buyOrder.encPrice, sellOrder.encPrice);

        // Make the result publicly decryptable so frontend can read it
        FHE.makePubliclyDecryptable(priceMatches);

        bytes32 resultHandle = FHE.toBytes32(priceMatches);

        uint256 matchId = ++matchCount;
        pendingMatches[matchId] = PendingMatch({
            buyId:        buyId,
            sellId:       sellId,
            resultHandle: resultHandle,
            resolved:     false
        });

        emit MatchRequested(matchId, buyId, sellId, resultHandle);
    }

   function finalizeMatch(
    uint256        matchId,
    bytes memory   abiEncodedCleartexts,
    bytes memory   decryptionProof        // single bytes, not bytes[]
) external {
    PendingMatch storage m = pendingMatches[matchId];
    require(!m.resolved, "Already resolved");
    require(m.buyId != 0, "Match not found");

    bytes32[] memory handles = new bytes32[](1);
    handles[0] = m.resultHandle;

    FHE.checkSignatures(handles, abiEncodedCleartexts, decryptionProof);

    bool priceMatches = abi.decode(abiEncodedCleartexts, (bool));

    m.resolved = true;

    if (priceMatches) {
        orders[m.buyId].status  = OrderStatus.MATCHED;
        orders[m.sellId].status = OrderStatus.MATCHED;
        _removeFromPending(pendingBuyIds,  m.buyId);
        _removeFromPending(pendingSellIds, m.sellId);
        emit OrderMatched(m.buyId, m.sellId);
    }
}
    //  View Functions
    function getOrderMeta(uint256 orderId) external view returns (
        address     owner,
        OrderSide   side,
        uint256     timestamp,
        OrderStatus status
    ) {
        Order storage o = orders[orderId];
        return (o.owner, o.side, o.timestamp, o.status);
    }

    function getPendingBuyCount()  external view returns (uint256) { return pendingBuyIds.length; }
    function getPendingSellCount() external view returns (uint256) { return pendingSellIds.length; }
    function getTotalOrders()      external view returns (uint256) { return orderCount; }

    //  Internal Helpers 
    function _removeFromPending(uint256[] storage arr, uint256 id) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == id) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                return;
            }
        }
    }
}