// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BorrowLend {
    struct Request {
        uint amount;
        uint timeInMonths;
        uint annualInterestRate;
        uint acceptCode;
        uint closeCode;
        uint mobileNumber; // New field for mobile number
        address requester;
        bool accepted;
        bool closed;
    }

    Request[] public borrowRequests;
    Request[] public lendRequests;
    Request[] public acceptedBorrowRequests;
    Request[] public acceptedLendRequests;
    Request[] public closedBorrowRequests;
    Request[] public closedLendRequests;

    event BorrowRequestCreated(uint indexed requestId, uint amount, uint timeInMonths, uint annualInterestRate, address requester);
    event LendRequestCreated(uint indexed requestId, uint amount, uint timeInMonths, uint annualInterestRate, address requester);
    event BorrowRequestAccepted(uint indexed requestId, uint acceptCode);
    event LendRequestAccepted(uint indexed requestId, uint acceptCode);
    event BorrowRequestClosed(uint indexed requestId, uint closeCode);
    event LendRequestClosed(uint indexed requestId, uint closeCode);

    function createBorrowRequest(uint _amount, uint _timeInMonths, uint _annualInterestRate, uint _acceptCode, uint _closeCode, uint _mobileNumber) external {
        borrowRequests.push(Request(_amount, _timeInMonths, _annualInterestRate, _acceptCode, _closeCode, _mobileNumber, msg.sender, false, false));
        emit BorrowRequestCreated(borrowRequests.length - 1, _amount, _timeInMonths, _annualInterestRate, msg.sender);
    }

    function createLendRequest(uint _amount, uint _timeInMonths, uint _annualInterestRate, uint _acceptCode, uint _closeCode, uint _mobileNumber) external {
        lendRequests.push(Request(_amount, _timeInMonths, _annualInterestRate, _acceptCode, _closeCode, _mobileNumber, msg.sender, false, false));
        emit LendRequestCreated(lendRequests.length - 1, _amount, _timeInMonths, _annualInterestRate, msg.sender);
    }

    function acceptBorrowRequest(uint index, uint _acceptCode) external {
        require(index < borrowRequests.length, "Invalid index");
        require(borrowRequests[index].accepted == false, "Request already accepted");
        require(borrowRequests[index].acceptCode == _acceptCode, "Incorrect accept code");
        borrowRequests[index].accepted = true;
        acceptedBorrowRequests.push(borrowRequests[index]);
        emit BorrowRequestAccepted(index, _acceptCode);
    }

    function acceptLendRequest(uint index, uint _acceptCode) external {
        require(index < lendRequests.length, "Invalid index");
        require(lendRequests[index].accepted == false, "Request already accepted");
        require(lendRequests[index].acceptCode == _acceptCode, "Incorrect accept code");
        lendRequests[index].accepted = true;
        acceptedLendRequests.push(lendRequests[index]);
        emit LendRequestAccepted(index, _acceptCode);
    }

    function closeBorrowRequest(uint index, uint _closeCode) external {
        require(index < acceptedBorrowRequests.length, "Invalid index");
        require(acceptedBorrowRequests[index].closed == false, "Request already closed");
        require(acceptedBorrowRequests[index].closeCode == _closeCode, "Incorrect close code");
        acceptedBorrowRequests[index].closed = true;
        closedBorrowRequests.push(acceptedBorrowRequests[index]);
        emit BorrowRequestClosed(index, _closeCode);
    }

    function closeLendRequest(uint index, uint _closeCode) external {
        require(index < acceptedLendRequests.length, "Invalid index");
        require(acceptedLendRequests[index].closed == false, "Request already closed");
        require(acceptedLendRequests[index].closeCode == _closeCode, "Incorrect close code");
        acceptedLendRequests[index].closed = true;
        closedLendRequests.push(acceptedLendRequests[index]);
        emit LendRequestClosed(index, _closeCode);
    }

    function getOpenBorrowRequests() external view returns (Request[] memory) {
        return borrowRequests;
    }

    function getOpenLendRequests() external view returns (Request[] memory) {
        return lendRequests;
    }

    function getAcceptedBorrowRequests() external view returns (Request[] memory) {
        return acceptedBorrowRequests;
    }

    function getAcceptedLendRequests() external view returns (Request[] memory) {
        return acceptedLendRequests;
    }

    function getClosedBorrowRequests() external view returns (Request[] memory) {
        return closedBorrowRequests;
    }

    function getClosedLendRequests() external view returns (Request[] memory) {
        return closedLendRequests;
    }
}
