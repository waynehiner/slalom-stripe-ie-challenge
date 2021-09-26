/* --- Functions we expect you will need to modify to complete the solution -- */
/** 
 * Shows the "#customer-exists-error" div when a customer already existis.  
 * To complete: finish this to display the customers email address and a link to their account_update form. 
 */
var showCustomerExistsError = function() {
  var errorMsgDiv = document.querySelector("#customer-exists-error");
  errorMsgDiv.removeAttribute("hidden");
  document.querySelector("#submit").classList.add("hidden");
  errorMsgDiv.removeAttribute("hidden");
  changeLoadingState(false);
}



/**** ----  Additional helpers - you are welcome to modify. *****/

/* Shows a success / error message when the payment is complete */
var signupComplete = function(json) {
  document.querySelector(".sr-payment-form").classList.add("hidden");
  document.querySelector(".completed-view").classList.remove("hidden");
  setTimeout(function() {
      document.querySelector(".completed-view").classList.add("expand");
    }, 200);
  changeLoadingState(false);
  document.querySelector("#submit").setAttribute("disabled", "disabled");
};


/* logic to display available lesson times and toggle the display of the sign up form . */
function appendLeadingZeroes(n){
  if(n <= 9){
    return "0" + n;
  }
  return n
}
const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
let firstSession = new Date();
firstSession.setDate(firstSession.getDate()+9);
let firstSess= appendLeadingZeroes(firstSession.getDate()) + " " + months[firstSession.getMonth()];
let firstDate = `${firstSess} 3:00 p.m.`;
let firstLineItem = `Guitar Lesson request: ${firstDate}`;


let secondSession = new Date();
secondSession.setDate(secondSession.getDate()+14);
let secondSess= appendLeadingZeroes(secondSession.getDate()) + " " + months[secondSession.getMonth()] ;
let secondDate = `${secondSess} 4:00 p.m.`;
let secondLineItem = `Guitar Lesson request: ${secondDate}`;


let thirdSession = new Date();
thirdSession.setDate(thirdSession.getDate()+21);
let thirdSess= appendLeadingZeroes(thirdSession.getDate()) + " " + months[thirdSession.getMonth()];
let thirdDate = `${thirdSess} 5:00 p.m.`;
let thirdLineItem = `Guitar Lesson request: ${thirdDate}`;

const allitems = {
  first : {
    itemId: 'first',
    title: firstDate,
    date: firstSess,
    time: '3:00 p.m.',
  },
  second : {
    itemId: 'second',
    title: secondDate,
    date: secondSess,
    time: '4:00 p.m.',
  },
  third : {
    itemId: 'third',
    title: thirdDate,
    date: thirdSess,
    time: '5:00 p.m.',
  }
};

/** 
 * Generates the HTML for the lesson sign up options 
 */
function generateHtmlForitemsPage(){
  function generateHtmlForSingleitem(id, date, time){
    result = `
        <div class="sr-item" 
        id=\'${id}\'
        onclick="toggleItem(\'${id}\')"
                >
          <div class="sr-lesson-title">
            <div class="sr-lesson-date">${date}</div>
            <br>
            <div class="sr-lesson-time">${time}</div>
          </div>
          <button2 id="${id}">
            <p class="sr-buton-label">Book Now!</p>
          </button>
        </div>
      `;
    return result;
  }
  var html = '';
  Object.values(allitems).forEach((item) => {
    html += generateHtmlForSingleitem(item.itemId, item.date, item.time);
  });

  document.getElementById('sr-items').innerHTML += html;
}

generateHtmlForitemsPage();

/** 
 * Shows the registration form if session is selected. 
 */
var toggleRegForm = function(showRegForm) {
  var formElts = document.querySelectorAll('.sr-form-container');
  if (showRegForm) {
    formElts.forEach(function(elt) {
      elt.classList.remove('hidden');
    });
  } else {
    formElts.forEach(function(elt) {
      elt.classList.add('hidden');
    });
  }  
}

toggleRegForm(false);


let toggleItem = function(id) {
  clear();
  allitems[id].selected = !allitems[id].selected;
  let dateElt = document.getElementById(id);
  let summaryTableItem = document.getElementById(id).textContent;
  if (allitems[id].selected) {
    dateElt.classList.add('selected');
    document.querySelector("#summary-table").innerHTML = `<font>You have requested a lesson for ${summaryTableItem} Please complete the registration form to reserve your lesson.</font>`;
    toggleRegForm(true);
  }
  else {
    dateElt.classList.remove('selected');
    document.querySelector("#summary-table").textContent = "";
    toggleRegForm(false);
  }
  // getSelectedItems();
  allitems[id].selected = !allitems[id].selected;
  // console.log(getSelectedItems());
  let registration = summaryTableItem;
  console.log(registration);
}

let clear = function () {
  let allElt = document.querySelectorAll(".sr-item");
  allElt.forEach (function(elt) {
    elt.classList.remove("selected");
  });
};