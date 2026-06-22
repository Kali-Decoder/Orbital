// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address public owner;

    struct Task {
        address payable agent;
        uint256 amount;
        bool isCompleted;
        bool isPaid;
        string verifiedDid;  // NEW: agent's T3N verified identity
    }

    mapping(uint256 => Task) public tasks;
    uint256 public taskCount;

    event TaskCreated(uint256 taskId, address agent, uint256 amount, string verifiedDid);
    event TaskCompleted(uint256 taskId);
    event PaymentReleased(uint256 taskId, address agent, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    // Now requires a verified DID — task cannot be created without one
    function createTask(address payable _agent, string calldata _verifiedDid) external payable {
        require(msg.value > 0, "Must lock some ETH");
        require(bytes(_verifiedDid).length > 0, "Must provide verified agent DID");

        taskCount++;
        tasks[taskCount] = Task(_agent, msg.value, false, false, _verifiedDid);
        emit TaskCreated(taskCount, _agent, msg.value, _verifiedDid);
    }

    function markCompleted(uint256 _taskId) external {
        require(msg.sender == owner, "Only owner can mark complete");
        require(!tasks[_taskId].isCompleted, "Already completed");
        tasks[_taskId].isCompleted = true;
        emit TaskCompleted(_taskId);
    }

    function releasePayment(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.isCompleted, "Task not completed yet");
        require(!task.isPaid, "Already paid");
        task.isPaid = true;
        task.agent.transfer(task.amount);
        emit PaymentReleased(_taskId, task.agent, task.amount);
    }
}