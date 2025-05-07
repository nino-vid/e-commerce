// import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import { useState } from "react";

// const StripeCheckoutForm = ({ amount }) => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const [loading, setLoading] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     // 1. Create payment intent
//     const res = await fetch("http://localhost:4000/api/v1/payment/process", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ amount }),
//     });

//     const { client_secret } = await res.json();
//     console.log("Client Secret:", client_secret);

//     // 2. Confirm payment
//     const result = await stripe.confirmCardPayment(client_secret, {
//       payment_method: {
//         card: elements.getElement(CardElement),
//       },
//     });

//     setLoading(false);

//     if (result.error) {
//       alert(result.error.message);
//     } else {
//       if (result.paymentIntent.status === "succeeded") {
//         setPaymentSuccess(true);
//       }
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
//       <button type="submit" disabled={!stripe || loading}>
//         {loading ? "Processing..." : "Pay"}
//       </button>
//       {paymentSuccess && <p>Payment Successful! 🎉</p>}
//     </form>
//   );
// };

// export default StripeCheckoutForm;

// import {
//   PaymentElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import { useState } from "react";

// const StripeCheckoutForm = () => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!stripe || !elements) return;

//     setLoading(true);

//     const { error } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: "http://localhost:3000/checkout/success",
//       },
//     });

//     if (error) {
//       setMessage(error.message);
//     } else {
//       setMessage("Redirecting...");
//     }

//     setLoading(false);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       {/* <PaymentElement /> */}
//       <div
//         style={{
//           minHeight: "100px",
//           minWidth: "200px",
//           border: "1px solid red",
//         }}
//       >
//         <PaymentElement
//           onReady={() => console.log("PaymentElement is ready")}
//         />
//       </div>
//       <button disabled={!stripe || loading}>
//         {loading ? "Processing…" : "Pay"}
//       </button>
//       {message && <p>{message}</p>}
//     </form>
//   );
// };

// export default StripeCheckoutForm;

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import "./StripeCheckoutForm.css";
import { useNavigate } from "react-router-dom";

const StripeCheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  // Log Stripe and Elements context on mount and when they change
  useEffect(() => {
    console.log("Stripe instance:", stripe);
    console.log("Elements instance:", elements);
    if (!stripe || !elements) {
      console.log("Cannot render form: stripe or elements not available");
    } else {
      console.log("Stripe and Elements ready, rendering PaymentElement");
    }
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Payment form not ready.");
      console.log("Submit blocked: stripe or elements missing");
      return;
    }

    setLoading(true);
    console.log("Submitting payment with elements:", elements);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      // redirect: "if_required",
      confirmParams: {
        return_url: "http://localhost:3000/checkout/success",
      },
    });

    if (error) {
      console.log("Payment error:", error);
      setMessage(error.message);
    } else if (paymentIntent?.status === "succeeded") {
      navigate("/Game-Store");
      alert("Payment succeeded!");
    } else {
      setMessage("Redirecting...");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="stripe-element-wrapper">
        {stripe && elements ? (
          <PaymentElement
            onReady={() => console.log("PaymentElement is ready")}
            onLoadError={(error) =>
              console.log("PaymentElement load error:", error)
            }
            options={{
              layout: "tabs", // or 'accordion', 'auto' — optional
            }}
          />
        ) : (
          <p>Loading payment form...</p>
        )}
      </div>
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="stripe-submit-button"
      >
        {loading ? "Processing…" : "Pay"}
      </button>
      {message && <p className="stripe-message">{message}</p>}
    </form>
  );
};

export default StripeCheckoutForm;
