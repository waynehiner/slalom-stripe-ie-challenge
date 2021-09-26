
/**
 * Shows the "#completed-view" div after a customer updates their card.
 * To complete: finish this to display the customers card information showing within the
 * #account-information div.
 */
const updateComplete = function(json) {
  document.querySelector(".sr-payment-form").classList.add("hidden");
  document.querySelector(".completed-view").classList.remove("hidden");
  setTimeout(function() {
      document.querySelector(".completed-view").classList.add("expand");
    }, 200);
  changeLoadingState(false);
  document.querySelector("#submit").setAttribute("disabled", "disabled");
};


