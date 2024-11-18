// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Splitwise {
    struct Expense {
        uint id;
        string description;
        address owner;
        address[] involvedMembers;
        uint[] amountsOwed;
        bool isSettled;
        bool[] hasPaid;
        uint interestRate;
        uint creationTimestamp;
    }

    // New: Token reward system
    mapping(address => uint) public rewardTokens;
    uint private constant INITIAL_REWARD = 100; // Initial reward amount
    uint private constant REWARD_PERIOD = 10 days; // Period over which reward decreases to zero

    function calculateReward(uint creationTimestamp) internal view returns (uint) {
        uint daysPassed = (block.timestamp - creationTimestamp) / 1 days;
        if (daysPassed >= 10) return 0;
        return INITIAL_REWARD - ((INITIAL_REWARD * daysPassed) / 10);
    }

    mapping(address => int) public balances;
    Expense[] public expenses;

    event ExpenseCreated(uint expenseId);
    event ExpenseSettled(uint expenseId);
    event TokensRewarded(address user, uint amount); // New event for token rewards

    function createExpense(
        address[] memory members,
        uint[] memory amounts,
        string memory description,
        uint interestRate
    ) public {
        require(members.length == amounts.length, "Mismatched arrays");

        uint timestamp = block.timestamp;

        uint newExpenseId = expenses.length;
        expenses.push(
            Expense(
                newExpenseId,
                description,
                msg.sender,
                members,
                amounts,
                false,
                new bool[](members.length),
                interestRate,
                timestamp
            )
        );

        emit ExpenseCreated(newExpenseId);

        for (uint i = 0; i < members.length; i++) {
            balances[members[i]] += int(amounts[i]);
        }
    }

    // Modified to include reward distribution
    function markUserAsPaid(uint[] memory expenseIds, address user) public {
        require(user != address(0), "Invalid user address");

        for (uint j = 0; j < expenseIds.length; j++) {
            uint expenseId = expenseIds[j];

            require(expenseId < expenses.length, "Expense does not exist");
            require(expenseId >= 0, "Invalid expense ID");

            uint paidCount = 0;

            for (
                uint i = 0;
                i < expenses[expenseId].involvedMembers.length;
                i++
            ) {
                if (expenses[expenseId].involvedMembers[i] == user) {
                    require(
                        !expenses[expenseId].hasPaid[i],
                        "User has already been marked as paid"
                    );

                    // Deduct the user's share from their balance
                    balances[user] -= int(expenses[expenseId].amountsOwed[i]);

                    expenses[expenseId].hasPaid[i] = true;

                    // Award tokens for settling based on time passed
                    uint reward = calculateReward(expenses[expenseId].creationTimestamp);
                    rewardTokens[user] += reward;
                    emit TokensRewarded(user, reward);
                }

                if (expenses[expenseId].hasPaid[i]) {
                    paidCount++;
                }
            }

            if (paidCount == expenses[expenseId].involvedMembers.length) {
                settleExpense(expenseId);
            }
        }
    }

    // New: Function to check user's reward tokens
    function getRewardTokens(address user) public view returns (uint) {
        return rewardTokens[user];
    }

    // Keeping existing functions unchanged
    function settleExpense(uint expenseId) public {
        require(expenseId < expenses.length, "Expense does not exist");
        require(!expenses[expenseId].isSettled, "Expense already settled");

        expenses[expenseId].isSettled = true;
        emit ExpenseSettled(expenseId);
    }

    function getBalance(address user) public view returns (int) {
        return balances[user];
    }

    function getExpensesOfCaller() public view returns (Expense[] memory) {
        uint count = 0;
        for (uint i = 0; i < expenses.length; i++) {
            for (uint j = 0; j < expenses[i].involvedMembers.length; j++) {
                if (expenses[i].involvedMembers[j] == msg.sender) {
                    count++;
                    break;
                }
            }
        }

        Expense[] memory callerExpenses = new Expense[](count);
        uint index = 0;

        for (uint i = 0; i < expenses.length; i++) {
            for (uint j = 0; j < expenses[i].involvedMembers.length; j++) {
                if (expenses[i].involvedMembers[j] == msg.sender) {
                    callerExpenses[index] = expenses[i];
                    index++;
                    break;
                }
            }
        }

        return callerExpenses;
    }

    function editExpense(uint expenseId, string memory newDescription) public {
        require(expenseId < expenses.length, "Expense does not exist");
        expenses[expenseId].description = newDescription;
    }

    function deleteExpense(uint expenseId) public {
        require(expenseId < expenses.length, "Expense does not exist");
        delete expenses[expenseId];
    }

    function getExpensesByOwner(
        address owner
    ) public view returns (Expense[] memory) {
        uint count = 0;
        for (uint i = 0; i < expenses.length; i++) {
            if (expenses[i].owner == owner) {
                count++;
            }
        }

        Expense[] memory ownerExpenses = new Expense[](count);
        uint index = 0;

        for (uint i = 0; i < expenses.length; i++) {
            if (expenses[i].owner == owner) {
                ownerExpenses[index] = expenses[i];
                index++;
            }
        }

        return ownerExpenses;
    }
}
