const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Splitwise", function () {
  let Splitwise, splitwise;
  let owner, member1, member2;

  beforeEach(async function () {
    [owner, member1, member2] = await ethers.getSigners();
    Splitwise = await ethers.getContractFactory("Splitwise");
    splitwise = await Splitwise.deploy();
  });

  describe("createExpense", function () {
    it("should create an expense and emit the correct event", async function () {
      const members = [member1.address, member2.address];
      const amounts = [100, 200];
      const description = "Dinner";
      const interestRate = 5;

      await expect(
        splitwise.createExpense(members, amounts, description, interestRate)
      )
        .to.emit(splitwise, "ExpenseCreated")
        .withArgs(0);

      const expense = await splitwise.expenses(0);
      expect(expense.description).to.equal(description);
      expect(expense.owner).to.equal(owner.address);
      expect(expense.isSettled).to.be.false;
    });

    it("should update balances correctly for involved members", async function () {
      await splitwise.createExpense(
        [member1.address, member2.address],
        [100, 200],
        "Dinner",
        5
      );

      const balance1 = await splitwise.getBalance(member1.address);
      const balance2 = await splitwise.getBalance(member2.address);

      expect(balance1).to.equal(100);
      expect(balance2).to.equal(200);
    });
  });

  describe("markUsersAsPaid", function () {
    beforeEach(async function () {
      await splitwise.createExpense(
        [member1.address, member2.address],
        [100, 200],
        "Dinner",
        5
      );
    });

    it("should mark multiple users as paid and update their balances", async function () {
      await splitwise
        .connect(owner)
        .markUsersAsPaid(0, [member1.address, member2.address]);

      const balance1 = await splitwise.getBalance(member1.address);
      const balance2 = await splitwise.getBalance(member2.address);

      expect(balance1).to.equal(0);
      expect(balance2).to.equal(0);
    });

    it("should settle the expense when all users have paid", async function () {
      await splitwise
        .connect(owner)
        .markUsersAsPaid(0, [member1.address, member2.address]);

      const expense = await splitwise.expenses(0);
      expect(expense.isSettled).to.be.true;
    });

    it("should not settle the expense if only some users have paid", async function () {
      await splitwise.connect(owner).markUsersAsPaid(0, [member1.address]);

      const expense = await splitwise.expenses(0);
      expect(expense.isSettled).to.be.false;

      const balance1 = await splitwise.getBalance(member1.address);
      const balance2 = await splitwise.getBalance(member2.address);

      expect(balance1).to.equal(0); // Only member1 has paid
      expect(balance2).to.equal(200); // member2's balance should remain
    });
  });

  describe("getExpensesOfCaller", function () {
    it("should return expenses that involve the caller", async function () {
      await splitwise.createExpense(
        [member1.address, member2.address],
        [100, 200],
        "Dinner",
        5
      );
      await splitwise.createExpense(
        [owner.address, member1.address],
        [300, 100],
        "Lunch",
        5
      );

      const callerExpenses = await splitwise
        .connect(member1)
        .getExpensesOfCaller();
      expect(callerExpenses.length).to.equal(2);
    });
  });

  describe("editExpense", function () {
    beforeEach(async function () {
      await splitwise.createExpense([member1.address], [100], "Old Description", 5);
    });

    it("should edit the description of an existing expense", async function () {
      await splitwise.editExpense(0, "New Description");

      const expense = await splitwise.expenses(0);
      expect(expense.description).to.equal("New Description");
    });
  });

  describe("deleteExpense", function () {
    beforeEach(async function () {
      await splitwise.createExpense([member1.address], [100], "Dinner", 5);
    });

    it("should delete an expense", async function () {
      await splitwise.deleteExpense(0);

      const deletedExpense = await splitwise.expenses(0);
      expect(deletedExpense.description).to.equal("");
    });
  });

  describe("getExpensesByOwner", function () {
    it("should return expenses owned by a specific address", async function () {
      await splitwise.createExpense([member1.address], [100], "Dinner", 5);
      await splitwise.createExpense([member2.address], [200], "Lunch", 5);

      const ownerExpenses = await splitwise.getExpensesByOwner(owner.address);
      expect(ownerExpenses.length).to.equal(2);
    });
  });
});
