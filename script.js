"use strict";

// The database of the website
const account1 = {
  owner: "Khaled Mohamed",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  password: 1111,
  locale: "en-US",
  currency: "USD",
};

const account2 = {
  owner: "Amira Osama",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  password: 2222,
  locale: "en-GB",
  currency: "EUR",
};

const account3 = {
  owner: "Hassan Mohamed",
  movements: [1200, -200, 2340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  password: 3333,
  locale: "en-GB",
  currency: "EUR",
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  password: 4444,
  locale: "en-US",
  currency: "USD",
};
const accounts = [account1, account2, account3, account4];

// declaring some variable that i will use later
let accountActive;
let accountTo;
let timer;

// timer function
const startLogOutTimer = function () {
  const tick = function () {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    $(".loggedOutMsg").html(`You will be logged out in: ${min}:${sec}`);

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      $(".main").addClass("hidden");
      $(".username").removeClass("hidden");
      $(".password").removeClass("hidden");
      $(".loginButton").removeClass("hidden");
      $(".logoutButton").addClass("hidden");
      $(".welcomeText").html("Log in to get started");
      $(".username").val("");
      $(".password").val("");
      $(".username").blur();
    }
    time--;
  };

  let time = 600;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

// function to format currencies
const formattedCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

// function that calculates the balance (part of the update UI functions)
const calculateBalance = function (acc) {
  acc.balance = acc.movements.reduce((total, num) => total + num, 0);
  $(".accountBalance").html(
    formattedCur(acc.balance, acc.locale, acc.currency)
  );
};

// function that calculates the deposits (part of the update UI functions)

const calculateDeposits = function (acc) {
  const amountIn = acc.movements
    .filter((mov) => mov > 0)
    .reduce((total, num) => total + num, 0);
  $(".gotInAmount").html(formattedCur(amountIn, acc.locale, acc.currency));
};

// function that calculates the withdrawals (part of the update UI functions)

const calculateWithdrawals = function (acc) {
  const amountOut = acc.movements
    .filter((mov) => mov < 0)
    .reduce((total, num) => total + num, 0);
  $(".gotOutAmount").html(
    formattedCur(Math.abs(amountOut), acc.locale, acc.currency)
  );
};

// function that calculates the deposits (part of the update UI functions)

const calculateInterest = function (acc) {
  const interests = acc.movements
    .filter((mov) => mov > 0)
    .map((dep) => (dep * acc.interestRate) / 100)
    .reduce((acc, int) => acc + int, 0);
  $(".interestAmount").html(formattedCur(interests, acc.locale, acc.currency));
};

// function that displays the movements (part of the update UI functions)

const displayMovements = function (acc, sort = false) {
  $(".history").html("");
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const formattedMov = formattedCur(mov, acc.locale, acc.currency);
    const sumHTML = `<div class="transaction">
        <div class="actionType ${type}">${type}</div>
        <div class="actionAmount">${formattedMov}</div>
      </div>`;
    $(".history").prepend(sumHTML);
  });
};

// Function for adding username property for each account on the database given "accounts array"
const creatingUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map(function (name) {
        return name[0];
      })
      .join("");
  });
};
creatingUsernames(accounts);

// Function that updates the ui which contains multiple functions
const updateUI = function (acc) {
  calculateBalance(acc);
  calculateDeposits(acc);
  calculateInterest(acc);
  calculateWithdrawals(acc);
  displayMovements(acc);
};

// events
// login event
$(".loginButton").on("click", function (e) {
  e.preventDefault();
  // checking if the info is correct
  accountActive = accounts.find((acc) => $(".username").val() === acc.username);
  if (accountActive?.password === Number($(".password").val())) {
    $(".welcomeText").html(
      `Welcome back, ${accountActive.owner.split(" ")[0]}!`
    );
    // this is the function i will use to get current date
    const today = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };
    const todayDate = new Intl.DateTimeFormat(
      accountActive.locale,
      options
    ).format(today);
    $(".balanceDate").html(`As of: ${todayDate}`);

    // timer starts
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    $(".username").addClass("hidden");
    $(".password").addClass("hidden");
    $(".loginButton").addClass("hidden");
    $(".logoutButton").removeClass("hidden");
    $(".main").removeClass("hidden");
    updateUI(accountActive);
  } else {
    $(".username").val("");
    $(".password").val("");
    $(".password").blur();
    // popup window that appears
    $(".popup").removeClass("hidden");
    $(".overlay").removeClass("hidden");
    $(".popupHeader").html("Wrong username/password!");
    $(".popupMessage").html(
      "The username or password that you have entered are not correct.\n Please make sure to try again using the correct username and password."
    );
  }
});

// transfer money event

$(".transferButton").on("click", function (ev) {
  ev.preventDefault();
  const amount = Number($(".transferAmount").val());
  const receiverAccount = accounts.find(
    (acc) => $(".transferTo").val() === acc.username
  );
  $(".transferTo").val("");
  $(".transferAmount").val("");
  $(".transferAmount").blur();
  // checking if the money and username are valid or not
  if (
    amount > 0 &&
    accountActive.balance > amount &&
    receiverAccount?.username !== accountActive.username
  ) {
    accountActive.movements.push(-amount);
    receiverAccount.movements.push(amount);
    updateUI(accountActive);
  } else {
    $(".transferTo").val("");
    $(".transferAmount").val("");
    $(".transferAmount").blur();
    // popup window that appears
    $(".popup").removeClass("hidden");
    $(".overlay").removeClass("hidden");
    $(".popupMessage").html(
      "The information you have entered appear to not be correct.\n Make sure to enter the correct username you want to transfer that amount of money to\n and the correct amount of money to be transferred."
    );
    $(".popupHeader").html(`Incorrect Information!`);
  }
  clearInterval(timer);
  timer = startLogOutTimer();
  updateUI(accountActive);
});

// Requesting a loan event
$(".requestButton").on("click", function (e) {
  e.preventDefault();
  const loan = Math.floor($(".loanAmount").val());
  if (accountActive.movements.some((val) => val >= loan * 0.1)) {
    accountActive.movements.push(loan);
    updateUI(accountActive);
    $(".loanAmount").val("");
    $(".loanAmount").blur();
  } else {
    $(".popup").removeClass("hidden");
    $(".overlay").removeClass("hidden");
    $(".popupHeader").html("The request is denied.");
    $(".popupMessage").html(
      "The bank has a rule that it only grants a loan if there's at least one deposit with at least 10% of the requested amount."
    );
    $(".loanAmount").html("");
    $(".loanAmount").blur();
  }
  clearInterval(timer);
  timer = startLogOutTimer();
});

// Deleting the account event
$(".closeAccountButton").on("click", function (e) {
  e.preventDefault();
  if (
    $(".confirmUsername").val() === accountActive.username &&
    Number($(".confirmPassword").val()) === accountActive.password
  ) {
    const i = accounts.findIndex(
      (acc) => acc.username === accountActive.username
    );
    accounts.splice(i, 1);
    $(".popup").removeClass("hidden");
    $(".overlay").removeClass("hidden");
    $(".popupHeader").html("You have deleted your account.");
    $(".popupMessage").html("You will now be returned to the main menu.");
    $(".main").addClass("hidden");
    $(".username").removeClass("hidden");
    $(".password").removeClass("hidden");
    $(".loginButton").removeClass("hidden");
    $(".logoutButton").addClass("hidden");
    $(".welcomeText").html("Log in to get started");
    $(".username").val("");
    $(".password").val("");
    $(".username").blur();
  } else {
    $(".confirmUsername").val("");
    $(".confirmPassword").val("");
    $(".confirmUsername").blur();
    $(".popup").removeClass("hidden");
    $(".overlay").removeClass("hidden");
    $(".popupHeader").html("You have entered the wrong username/password.");
    $(".popupMessage").html(
      "Please confirm your username and password to be able to delete your account."
    );
  }
});

// sort button
let sorted = false;
$(".sortButton").on("click", function (e) {
  e.preventDefault();
  displayMovements(accountActive, !sorted);
  sorted = !sorted;
});

// logout button and its functionality
$(".logoutButton").on("click", function (e) {
  e.preventDefault();
  $(".main").addClass("hidden");
  $(".username").removeClass("hidden");
  $(".password").removeClass("hidden");
  $(".loginButton").removeClass("hidden");
  $(".logoutButton").addClass("hidden");
  $(".welcomeText").html("Log in to get started");
  $(".username").val("");
  $(".password").val("");
  $(".username").blur();
});

// closing the popups
const closingPopup = function () {
  $(".popup").addClass("hidden");
  $(".overlay").addClass("hidden");
};
$(".closePopup").on("click", closingPopup);

$(".overlay").on("click", closingPopup);

$(document).on("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closingPopup();
  }
});
