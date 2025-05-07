import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeCheckoutForm from "../../Components/Payments/StripeCheckoutForm";

// Log the local Stripe API key to verify
console.log("Local Stripe API Key:", process.env.REACT_APP_STRIPE_API_KEY);

// Initialize stripePromise with hardcoded key
const stripePromise = loadStripe(
  "pk_test_51Nf27kIzcu2zopbrHYtPDjoa7uUO3n4HV8SkSZLafMQnhzSfc5QY0rhskoUMb9V9vstttlR7XQB1ORZ8oCPiFXO1000OLCzjUy"
);

// ✅ Custom hook to track if component is mounted
function useIsMounted() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const { state } = useLocation();
  const amount = state?.amount || 2499;
  const isMounted = useIsMounted();

  useEffect(() => {
    console.log("CheckoutPage mounted");
    console.log("Location state:", state);

    stripePromise
      .then((stripe) => {
        console.log("Stripe initialized:", !!stripe);
        if (isMounted.current) {
          setStripeLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Stripe init error:", err.message, err.stack);
        if (isMounted.current) {
          setError(
            `Failed to initialize Stripe: ${err.message}. Please check your Stripe configuration.`
          );
        }
      });
  }, [isMounted, state]);

  useEffect(() => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Invalid or missing amount.");
      console.log("Invalid amount:", amount);
      return;
    }

    const controller = new AbortController();
    const fetchClientSecret = async () => {
      console.log("Fetching clientSecret for amount:", amount);
      try {
        const res = await fetch(
          "http://localhost:4000/api/v1/payment/process",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Failed to fetch clientSecret: ${res.status} ${text.slice(
              0,
              50
            )}...`
          );
        }
        const data = await res.json();
        console.log("API response:", data);
        if (isMounted.current) {
          if (data.success && data.clientSecret) {
            console.log("Setting clientSecret:", data.clientSecret);
            setClientSecret(data.clientSecret);
          } else {
            setError(
              `Payment setup failed: ${data.message || "Missing clientSecret"}`
            );
          }
        } else {
          console.log("Component unmounted before setting clientSecret");
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted due to component unmount");
          return;
        }
        console.error("Fetch error:", err);
        if (isMounted.current) {
          setError("Failed to load payment form: " + err.message);
        }
      }
    };

    fetchClientSecret();

    return () => {
      console.log("Aborting fetchClientSecret");
      controller.abort();
    };
  }, [amount, isMounted]);

  const appearance = {
    theme: "stripe", // Options: 'stripe', 'night', 'flat', 'none'
    variables: {
      colorPrimary: "#0570de",
      colorBackground: "#ffffff",
      colorText: "#30313d",
      colorDanger: "#df1b41",
      fontFamily: "Ideal Sans, system-ui, sans-serif",
      spacingUnit: "2px",
      borderRadius: "4px",
    },
  };
  const options = { clientSecret, appearance };

  console.log("Elements options:", options);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h2>Complete Your Payment</h2>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : stripeLoaded && clientSecret ? (
        <>
          <p
            style={{
              marginTop: "20px",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Amount: ${amount / 100}
          </p>
          <Elements stripe={stripePromise} options={options}>
            <StripeCheckoutForm />
          </Elements>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CheckoutPage;

// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
// import StripeCheckoutForm from "../../Components/Payments/StripeCheckoutForm";

// const stripePromise = loadStripe(process.env.STRIPE_API_KEY);

// const CheckoutPage = () => {
//   const [clientSecret, setClientSecret] = useState(null);
//   const { state } = useLocation();
//   const amount = state?.amount;

//   useEffect(() => {
//     console.log("Inside useEffect");
//     fetch("http://localhost:4000/api/v1/payment/process", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ amount }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Payment Intent response:", data);
//         setClientSecret(data.clientSecret);
//       })
//       .catch((err) => console.error("Error fetching clientSecret:", err));
//   }, []);

//   const appearance = { theme: "stripe" };
//   const options = { clientSecret, appearance };

//   return (
//     <div>
//       <h2>Complete Your Payment</h2>
//       {clientSecret && (
//         <Elements stripe={stripePromise} options={options}>
//           <StripeCheckoutForm />
//         </Elements>
//       )}
//     </div>
//   );
// };

// export default CheckoutPage;
