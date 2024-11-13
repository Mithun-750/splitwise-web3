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
        bool[] hasPaid; // Boolean array to track who has paid
        uint interestRate; // New field for interest rate (in percent, e.g., 5%)
        uint creationTimestamp; // Timestamp when the expense is created
    }

    mapping(address => int) public balances;

    Expense[] public expenses;

    event ExpenseCreated(uint expenseId);
    event ExpenseSettled(uint expenseId);

    function createExpense(
        address[] memory members,
        uint[] memory amounts,
        string memory description,
        uint interestRate // New parameter for interest rate
    ) public {
        require(members.length == amounts.length, "Mismatched arrays");

        uint timestamp = block.timestamp;

        // Create a new expense
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

        // Emit the ExpenseCreated event
        emit ExpenseCreated(newExpenseId);

        // Update balances for the involved members
        for (uint i = 0; i < members.length; i++) {
            balances[members[i]] += int(amounts[i]);
        }
    }

    function markUserAsPaid(uint[] memory expenseIds, address user) public {
        require(expenseIds.length > 0, "No expenses provided");
        require(user != address(0), "Invalid user address");

        uint paidCount = 0;

        // Loop through all the provided expenseIds
        for (uint i = 0; i < expenseIds.length; i++) {
            uint expenseId = expenseIds[i];
            require(expenseId < expenses.length, "Expense does not exist");

            // Find the index of the user in the involvedMembers array
            bool userFound = false;
            uint userIndex = 0;

            for (
                uint j = 0;
                j < expenses[expenseId].involvedMembers.length;
                j++
            ) {
                if (expenses[expenseId].involvedMembers[j] == user) {
                    userIndex = j;
                    userFound = true;
                    break;
                }
            }

            require(userFound, "User is not involved in this expense");
            require(
                !expenses[expenseId].hasPaid[userIndex],
                "User has already been marked as paid"
            );

            // Deduct the user's share from their balance
            balances[user] -= int(expenses[expenseId].amountsOwed[userIndex]);

            // Mark the user as paid for this specific expense
            expenses[expenseId].hasPaid[userIndex] = true;

            // Check if all involved members for this expense have paid
            bool allPaid = true;
            for (uint k = 0; k < expenses[expenseId].hasPaid.length; k++) {
                if (!expenses[expenseId].hasPaid[k]) {
                    allPaid = false;
                    break;
                }
            }

            // If all members have paid, mark the expense as settled
            if (allPaid && !expenses[expenseId].isSettled) {
                settleExpense(expenseId);
            }

            paidCount++;
        }

        // If all expenses for this user are marked as paid, check for settlement
        if (paidCount == expenseIds.length) {
            // Additional logic if needed for tracking
        }
    }

    function settleExpense(uint expenseId) public {
        require(expenseId < expenses.length, "Expense does not exist");
        require(!expenses[expenseId].isSettled, "Expense already settled");

        // Mark expense as settled
        expenses[expenseId].isSettled = true;

        emit ExpenseSettled(expenseId);
    }

    function getBalance(address user) public view returns (int) {
        return balances[user];
    }

    function getExpensesOfCaller() public view returns (Expense[] memory) {
        uint count = 0;
        // Count the number of expenses involving the caller
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
        // Add the logic to edit the description of an expense
        require(expenseId < expenses.length, "Expense does not exist");
        expenses[expenseId].description = newDescription;
    }

    function deleteExpense(uint expenseId) public {
        // Add the logic to delete an expense
        require(expenseId < expenses.length, "Expense does not exist");
        delete expenses[expenseId];
    }

    function getExpensesByOwner(
        address owner
    ) public view returns (Expense[] memory) {
        uint count = 0;
        // Count the number of expenses owned by the provided address
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
