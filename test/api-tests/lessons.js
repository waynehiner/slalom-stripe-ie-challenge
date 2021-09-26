const { assert, expect } = require("chai");
let request = require("supertest");
const serverUrl = "http://localhost:4242";

// ***********************************************************
// Please fill with an existing customerId
// that has attached a valid payment method
// ***********************************************************
const customerId = "cus_JVwK6QQWzfNt3H";
const deletableCustomer = "cus_JXnlt2gMLYB7bB";

let paymentId = "";

describe("POST /schedule lesson", function () {
  it("Schedules a lesson and returns payment intent id", function (done) {
    request(serverUrl)
      .post("/schedule-lesson")
      .send({
        customer_id: customerId,
        amount: 2345,
        description: "Test API lesson 1",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        paymentId = response.body.id;
        return done();
      })
      .catch((err) => done(err));
  });

  it("Schedules a lesson and POST /captures Captures the charge", function (done) {
    request(serverUrl)
      .post("/schedule-lesson")
      .send({
        customer_id: customerId,
        amount: 3456,
        description: "Test API lesson 1",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        paymentId = response.body.id;
        request(serverUrl)
          .post("/complete-lesson-payment")
          .send({
            payment_intent_id: paymentId,
            amount: 3456,
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200);

        return done();
      })
      .catch((err) => done(err));
  });

  it("POST /refund Refunds the charge", function (done) {
    request(serverUrl)
      .post("/schedule-lesson")
      .send({
        customer_id: customerId,
        amount: 4567,
        description: "Test API lesson 1",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        paymentId = response.body.id;
        request(serverUrl)
          .post("/complete-lesson-payment")
          .send({
            payment_intent_id: paymentId,
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(() => {
            request(serverUrl)
              .post("/refund-lesson")
              .send({
                payment_intent_id: paymentId,
                amount: 4567,
              })
              .set("Accept", "application/json")
              .expect("Content-Type", /json/)
              .expect(200);
          });

        return done();
      })
      .catch((err) => done(err));
  });
});

describe("GET /totals earned from lessons", function () {
  it("Returns totals in response", function (done) {
    request(serverUrl)
      .get("/calculate-lesson-total")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).to.include.keys("payment_total");
        return done();
      })
      .catch((err) => done(err));
  });
});

describe("GET /find customers with failed payments", function () {
  this.timeout(6000);
  it("Returns a customer with failed payments", function (done) {
    request(serverUrl)
      .get("/find-customers-with-failed-payments")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body);
        return done();
      })
      .catch((err) => done(err));
  });
});

describe("POST /delete customer", function () {
  this.timeout(3000);
  it("Returns 200 when deleting a customer", function (done) {
    request(serverUrl)
      .post(`/delete-account/${deletableCustomer}`)
      .expect(200)
      .then((response) => {
        return done();
      })
      .catch((err) => done(err));
  });
});
