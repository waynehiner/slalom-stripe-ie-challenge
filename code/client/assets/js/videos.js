
var allitems = {};
var minitemsForDiscount;
var discountFactor;

var orderData = {
  items:null, 
  changed:false
};


var getSelecteditems = function() {
  return Object.values(allitems).filter(item => item.selected);
};


/*
 * handle an update to the items selected.  Toggles the payment form.
*/
var onSelectionChanged = function(e) {
  var selecteditems = getSelecteditems();
  orderData['items'] = selecteditems.map(item => item.itemId);

  updateSummaryTable();
  togglePaymentForm();
};


/**
 * Shows the payment form if there are items to purchase.
 */
var togglePaymentForm = function() {
    var selecteditems = getSelecteditems();
    var showPaymentForm = selecteditems.length > 0;
    var paymentFormElts = document.querySelectorAll('.sr-payment-form, .summary-table');
    if (showPaymentForm) {
      document.querySelector(".purchase-section").classList.remove("hidden");
      paymentFormElts.forEach(function(elt) {
        elt.classList.remove('hidden');
      });
    } else {
      document.querySelector(".purchase-section").classList.add("hidden");
      paymentFormElts.forEach(function(elt) {
        elt.classList.add('hidden');
      });
    }  
}

/*
 * Toggles the title of the payment summary form.
 */ 
var toggleSummaryPreface = function (showPreface) {
  preface = '';
  if (showPreface) {
    preface = 'No courses selected.';
  }
  document.getElementById('summary-preface').innerHTML = preface;
}

/*
 * Updates the summary table of videos selected and calculated the total and the discount
 */
var updateSummaryTable = function() {
  var computeSubtotal = function() {
    var selecteditems = getSelecteditems();
    return selecteditems
      .map(item => item.price)
      .reduce((item1, item2) => item1 + item2, 0);
  };

  var computeDiscountPercent = function() {
    var selecteditems = getSelecteditems();
    var eligibleForDiscount = selecteditems.length >= minitemsForDiscount;
    return eligibleForDiscount ? discountFactor : 0;
  };

  var selecteditems = getSelecteditems();
  var discountPercent = computeDiscountPercent();
  var subtotal = computeSubtotal();
  var discount = discountPercent * subtotal;
  var total = subtotal - discount;

  var orderSummary = document.getElementById('summary-table');
  if (orderSummary) {
    var buildOrderSummaryRow = function(rowClass, desc, amountCents) {
        return `
          <div class="summary-title ${rowClass}">${capitalize(desc)}</div>
          <div class="summary-price ${rowClass}">${getPriceDollars(amountCents)}</div>
        `;
    };
    orderSummary.innerHTML = '';
    
    for (var i = 0; i < selecteditems.length; i++) {
      orderSummary.innerHTML += buildOrderSummaryRow('summary-product', selecteditems[i].title, selecteditems[i].price);
    }
    if (discount>0){
      orderSummary.innerHTML += buildOrderSummaryRow('summary-subtotal', 'Subtotal', subtotal);
      orderSummary.innerHTML += buildOrderSummaryRow('summary-discount', 'Discount', discount);
    }
    orderSummary.innerHTML += buildOrderSummaryRow('summary-total', 'Total', total);
  }

  toggleSummaryPreface(selecteditems.length == 0);
};


function capitalize(name){
  return name.charAt(0).toUpperCase() + name.slice(1);
}


function getPriceDollars(price, recurringBy=undefined) {
  var pricePart = '$' + Math.round(price / 100.0);
  if (recurringBy===undefined){
    return pricePart;
  }
  else{
    return pricePart + '/' + recurringBy;
  }
}

/*
 * getting videos and discount info to load the page.
 */
function init() {
  return fetch('/setup-video-page', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(handleErrors)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      minitemsForDiscount = Number(json.minItemsForDiscount);
      discountFactor = Number(json.discountFactor);
      allitems = json.items; 
      console.log(allitems);
      generateHtmlForitemsPage();
    });
   
}

document.querySelector(".purchase-section").classList.add("hidden");
init();
toggleSummaryPreface(true);
togglePaymentForm();

/* 
 * Generates the HTML for video courses. 
 */
function generateHtmlForitemsPage(){
  function generateHtmlForSingleitem(id, item, price, img, desc){
    result = `
        <div class="sr-item" 
        id=\'${id}\'
        onclick="toggleitem(\'${id}\')"
                >
          <div class="eco-product-img"
            >
            <img src=${img}>
          </div>
          <div class="eco-product-card">
            <div class="sr-item-text">${capitalize(item)}</div>
            <div class="video-desc-container">
              <div class="eco-desc-text">${desc}</div>
            </div>
            <button2 id="${id}">${getPriceDollars(price)}</button>
          </div>
        </div>
      `;
    return result;
  }
  var html = '';
  Object.values(allitems).forEach((item) => {
    html += generateHtmlForSingleitem(item.itemId, item.title, item.price, item.img, item.desc);
  });

  document.getElementById('sr-items').innerHTML += html;
}


function toggleitem(id){
  allitems[id].selected = !allitems[id].selected;
  var productElt = document.getElementById(id);
  if (allitems[id].selected) {
    productElt.classList.add('selected');
  }
  else {
    productElt.classList.remove('selected');
  }
  onSelectionChanged();
}


/* Shows a success / error message when the payment is complete */
var orderComplete = function() {
    document.querySelector(".sr-payment-form").classList.add("hidden");
    document.querySelector(".completed-view").classList.remove("hidden");
    setTimeout(function() {
      document.querySelector(".completed-view").classList.add("expand");
    }, 200);
    changeLoadingState(false);
    document.querySelector("#submit").setAttribute("disabled", "disabled");

};

// Challenge #2 | This for the stripe card
// A reference to Stripe.js initialized with your real test publishable API key.
document.addEventListener('DOMContentLoaded', async () => {
    var stripe = Stripe("pk_test_51JUynIGy7STpo4SohBV5HjuqdGzzWK5iSNZLtPGChd9luRBicLiKrosGSFtv7xqmN728nixbQQ6aox35vPsh1Ihi00qKSgIWI0");

    var elements = stripe.elements();
    var cardElement = elements.create('card');
    cardElement.mount("#card-element");
    const amount = document.getElementsByClassName("summary-price.summary-total").innerHTML;
    //cardElement.on("change", function (event) {
       // Disable the Pay button if there are no card details in the Element
      //document.getElementById("submit").disabled = event.empty;
      //document.getElementById("#card-error").textContent = event.error ? event.error.message : "";
    //});
    function setOutcome(result) {
      var successElement = document.querySelector('.success');
      var errorElement = document.querySelector('.error');
      successElement.classList.remove('visible');
      errorElement.classList.remove('visible');
    
      if (result.token) {
        // Use the token to create a charge or a customer
        // https://stripe.com/docs/charges
        successElement.querySelector('.token').textContent = result.token.id;
        successElement.classList.add('visible');
        $("#pay-now").text("You Have Paid")
      } else if (result.error) {
        $("#pay-now").removeAttr("disabled")
        errorElement.textContent = result.error.message;
        errorElement.classList.add('visible');
      }
    }
    
// Disable button until all of cardElement is filled out
    function checkIfCardComplete(elementsEvent) {
      if (elementsEvent.complete) {
        document.getElementById('submit').removeAttribute('disabled');
      } else {
          document.getElementById('submit').disabled = true;
      }
  }
  cardElement.on('change', function (event) {
      checkIfCardComplete(event);
  });
    
    cardElement.on('change', function(event) {
      setOutcome(event);
      checkIfCardComplete(event);
    });

    // Handle the PaymentIntent
    const btn = document.getElementById('submit');
    btn.addEventListener('click', async (e) => {
        //addMessage('Submitting details to the backend');
        e.preventDefault();
        // Create PaymentIntent on the Server
        const {clientSecret} = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentMethodType: 'card',
                currency: 'usd',
                amount: 1500,
            }),
        }).then(r => r.json());

        //addMessage('PaymentIntent created!');

        const nameInput = document.querySelector('#name');
        const emailInput = document.querySelector('#email');
        const { paymentIntent } = await stripe.confirmCardPayment(
            clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: nameInput.value,
                        email: emailInput.value,
                    }
                }
            }
        )
        //addMessage(`PaymentIntent (${paymentIntent.id}): ${paymentIntent.status}`);
        loading(paymentIntent)
        orderComplete();
    });
});


//// Calls stripe.confirmCardPayment
//// If the card requires authentication Stripe shows a pop-up modal to
//// prompt the user to enter authentication details without leaving your page.
//var payWithCard = function (stripe, card, clientSecret) {
//    loading(true);
//    stripe
//        .confirmCardPayment(clientSecret, {
//            payment_method: {
//                card: card
//            }
//        })
//        .then(function (result) {
//            if (result.error) {
//                // Show error to your customer
//                showError(result.error.message);
//            } else {
//                // The payment succeeded!
//                orderComplete(result.paymentIntent.id);
//            }
//        });
//};

///* ------- UI helpers ------- */

//// Shows a success message when the payment is complete
//var orderComplete = function (paymentIntentId) {
//    loading(false);
//    document
//        .querySelector(".result-message a")
//        .setAttribute(
//            "href",
//            "https://dashboard.stripe.com/test/payments/" + paymentIntentId
//        );
//    document.querySelector(".result-message").classList.remove("hidden");
//    document.querySelector("button").disabled = true;
//};

//// Show the customer the error from Stripe if their card fails to charge
//var showError = function (errorMsgText) {
//    loading(false);
//    var errorMsg = document.querySelector("#card-error");
//    errorMsg.textContent = errorMsgText;
//    setTimeout(function () {
//        errorMsg.textContent = "";
//    }, 4000);
//};

//// Show a spinner on payment submission
var loading = function (isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.getElementById("submit").disabled = true;
        document.getElementById("spinner").classList.remove("hidden");
        document.getElementById("button-text").classList.add("hidden");
    } else {
        document.getElementById("submit").disabled = false;
        document.getElementById("spinner").classList.add("hidden");
        document.getElementById("button-text").classList.remove("hidden");
    }
};