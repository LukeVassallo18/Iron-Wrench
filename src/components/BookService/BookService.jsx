import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import "./BookService.css";

const SERVICE_OPTIONS = [
  { value: "tyre-wheel", label: "Tyre & Wheel Fitting", price: 50 },
  { value: "brake-service", label: "Brake Service", price: 75 },
  { value: "engine-diagnostics", label: "Engine Diagnostics", price: 100 },
  { value: "oil-change", label: "Oil Change", price: 40 },
  {
    value: "chain-sprocket",
    label: "Chain & Sprocket Replacement",
    price: 120,
  },
  { value: "electrical-system", label: "Electrical System Repair", price: 80 },
];

const LABOUR_RATE = 0.2;
const formatEuro = (value) => `€${value.toFixed(2)}`;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getService = (serviceValue) =>
  SERVICE_OPTIONS.find((service) => service.value === serviceValue);

const getServiceLabel = (serviceValue) => {
  const found = getService(serviceValue);
  return found?.label ?? serviceValue;
};

const getServicePrice = (serviceValue) => {
  const found = getService(serviceValue);
  return found?.price ?? 0;
};

function BookService({ currentUser }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: "",
    services: [],
    date: "",
    timeSlot: "",
    name: currentUser?.displayName ?? "",
    phone: "",
    email: currentUser?.email ?? "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const subtotal = formData.services.reduce(
    (total, serviceValue) => total + getServicePrice(serviceValue),
    0,
  );
  const labourCost = subtotal * LABOUR_RATE;
  const approximateTotal = subtotal + labourCost;

  const updateField = (field) => (event) => {
    const value =
      field === "phone"
        ? event.target.value.replace(/\D+/g, "")
        : event.target.value;

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStepThree = () => {
    const nextErrors = {};

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName) {
      nextErrors.name = "Name is required.";
    } else if (!NAME_REGEX.test(trimmedName)) {
      nextErrors.name =
        "Name can only contain letters, spaces, apostrophes, and hyphens.";
    }

    if (!trimmedPhone) {
      nextErrors.phone = "Phone number is required.";
    } else if (!/^\d{7,15}$/.test(trimmedPhone)) {
      nextErrors.phone = "Phone number must contain 7 to 15 digits only.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const addServiceToCart = () => {
    if (!formData.serviceType) return;

    setFormData((prev) => {
      if (prev.services.includes(prev.serviceType)) {
        return { ...prev, serviceType: "" };
      }

      return {
        ...prev,
        services: [...prev.services, prev.serviceType],
        serviceType: "",
      };
    });
  };

  const removeServiceFromCart = (serviceToRemove) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service !== serviceToRemove),
    }));
  };

  const goNext = () => setCurrentStep((prev) => Math.min(3, prev + 1));
  const goBack = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateStepThree()) {
      setSubmitMessage("Please fix the highlighted fields.");
      return;
    }

    if (!db || !currentUser) {
      setSubmitMessage("Booking is unavailable right now.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      await addDoc(collection(db, "bookings"), {
        ...formData,
        serviceType: formData.services[0] ?? "",
        subtotal,
        labourCost,
        approximateTotal,
        currency: "EUR",
        userId: currentUser.uid,
        userEmail: currentUser.email ?? "",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmitMessage("Booking submitted successfully.");
      setCurrentStep(1);
      setFormData({
        serviceType: "",
        services: [],
        date: "",
        timeSlot: "",
        name: currentUser?.displayName ?? "",
        phone: "",
        email: currentUser?.email ?? "",
        notes: "",
      });

      navigate("/bookings");
    } catch {
      setSubmitMessage("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dotClass = (stepNumber) => {
    if (stepNumber < currentStep) return "dot dot-complete";
    if (stepNumber === currentStep) return "dot";
    return "dot dot-inactive";
  };

  return (
    <div className="book-service-container">
      <h2 className="book-service-title">Book your Service</h2>
      <div className="form-status-container">
        <span className={dotClass(1)}>1</span>
        <span className={dotClass(2)}>2</span>
        <span className={dotClass(3)}>3</span>
      </div>

      <div className="form-inputs">
        <form className="book-form" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <>
              <label className="form-field form-field-full">
                Select Service
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={updateField("serviceType")}
                >
                  <option value="">Choose a service...</option>
                  {SERVICE_OPTIONS.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="service-cart-actions">
                <button
                  type="button"
                  className="book-back-btn"
                  onClick={addServiceToCart}
                  disabled={!formData.serviceType}
                >
                  Add Service
                </button>
              </div>

              <div className="service-cart-list" aria-live="polite">
                {formData.services.length === 0 ? (
                  <p className="service-cart-empty">No services added yet.</p>
                ) : (
                  formData.services.map((service) => (
                    <div key={service} className="service-cart-item">
                      <span>
                        {getServiceLabel(service)} ·{" "}
                        {formatEuro(getServicePrice(service))}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeServiceFromCart(service)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {formData.services.length > 0 ? (
                <div className="service-cost-summary">
                  <p>
                    <strong>Services subtotal:</strong> {formatEuro(subtotal)}
                  </p>
                  <p>
                    <strong>
                      Labour (approx. {Math.round(LABOUR_RATE * 100)}%):
                    </strong>{" "}
                    {formatEuro(labourCost)}
                  </p>
                  <p className="service-total-line">
                    <strong>Approx. Total:</strong>{" "}
                    {formatEuro(approximateTotal)}
                  </p>
                </div>
              ) : null}

              <div className="form-actions form-actions-end">
                <button
                  type="button"
                  className="book-submit-btn"
                  onClick={goNext}
                  disabled={formData.services.length === 0}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <label className="form-field form-field-full">
                Date
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={updateField("date")}
                />
              </label>

              <label className="form-field form-field-full">
                Time Slot
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={updateField("timeSlot")}
                >
                  <option value="">Choose a time...</option>
                  <option value="morning">Morning (8am–12pm)</option>
                  <option value="afternoon">Afternoon (12pm–4pm)</option>
                  <option value="evening">Evening (4pm–6pm)</option>
                </select>
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="book-back-btn"
                  onClick={goBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="book-submit-btn"
                  onClick={goNext}
                  disabled={!formData.date || !formData.timeSlot}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <label className="form-field form-field-full">
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={updateField("name")}
                  aria-invalid={Boolean(validationErrors.name)}
                />
                {validationErrors.name ? (
                  <span className="field-error">{validationErrors.name}</span>
                ) : null}
              </label>

              <label className="form-field form-field-full">
                Phone
                <input
                  type="tel"
                  name="phone"
                  placeholder="+353..."
                  value={formData.phone}
                  onChange={updateField("phone")}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-invalid={Boolean(validationErrors.phone)}
                />
                {validationErrors.phone ? (
                  <span className="field-error">{validationErrors.phone}</span>
                ) : null}
              </label>

              <label className="form-field form-field-full">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={updateField("email")}
                  aria-invalid={Boolean(validationErrors.email)}
                />
                {validationErrors.email ? (
                  <span className="field-error">{validationErrors.email}</span>
                ) : null}
              </label>

              <label className="form-field form-field-full">
                Notes (optional)
                <textarea
                  name="notes"
                  rows="4"
                  placeholder="Any details about your bike..."
                  value={formData.notes}
                  onChange={updateField("notes")}
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="book-back-btn"
                  onClick={goBack}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="book-submit-btn"
                  disabled={
                    isSubmitting ||
                    !formData.name ||
                    !formData.phone ||
                    !formData.email
                  }
                >
                  {isSubmitting ? "Submitting..." : "Confirm Booking"}
                </button>
              </div>

              <div className="service-cost-summary">
                <p>
                  <strong>Services subtotal:</strong> {formatEuro(subtotal)}
                </p>
                <p>
                  <strong>
                    Labour (approx. {Math.round(LABOUR_RATE * 100)}%):
                  </strong>{" "}
                  {formatEuro(labourCost)}
                </p>
                <p className="service-total-line">
                  <strong>Approx. Total:</strong> {formatEuro(approximateTotal)}
                </p>
              </div>
            </>
          )}

          {submitMessage ? (
            <p className="book-submit-message">{submitMessage}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

export default BookService;
