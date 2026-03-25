import { useState } from 'react';
import './BookService.css';

function BookService() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        serviceType: '',
        date: '',
        timeSlot: '',
        name: '',
        phone: '',
        email: '',
        notes: '',
    });

    const updateField = (field) => (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const goNext = () => setCurrentStep((prev) => Math.min(3, prev + 1));
    const goBack = () => setCurrentStep((prev) => Math.max(1, prev - 1));

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    const dotClass = (stepNumber) => {
        if (stepNumber < currentStep) return 'dot dot-complete';
        if (stepNumber === currentStep) return 'dot';
        return 'dot dot-inactive';
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
                                    onChange={updateField('serviceType')}
                                >
                                    <option value="">Choose a service...</option>
                                    <option value="tyre-wheel">Tyre &amp; Wheel Fitting</option>
                                    <option value="brake-service">Brake Service</option>
                                    <option value="engine-diagnostics">Engine Diagnostics</option>
                                    <option value="oil-change">Oil Change</option>
                                    <option value="chain-sprocket">Chain &amp; Sprocket Replacement</option>
                                    <option value="electrical-system">Electrical System Repair</option>
                                </select>
                            </label>

                            <div className="form-actions form-actions-end">
                                <button
                                    type="button"
                                    className="book-submit-btn"
                                    onClick={goNext}
                                    disabled={!formData.serviceType}
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
                                    onChange={updateField('date')}
                                />
                            </label>

                            <label className="form-field form-field-full">
                                Time Slot
                                <select
                                    name="timeSlot"
                                    value={formData.timeSlot}
                                    onChange={updateField('timeSlot')}
                                >
                                    <option value="">Choose a time...</option>
                                    <option value="morning">Morning (8am–12pm)</option>
                                    <option value="afternoon">Afternoon (12pm–4pm)</option>
                                    <option value="evening">Evening (4pm–6pm)</option>
                                </select>
                            </label>

                            <div className="form-actions">
                                <button type="button" className="book-back-btn" onClick={goBack}>
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
                                    onChange={updateField('name')}
                                />
                            </label>

                            <label className="form-field form-field-full">
                                Phone
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+353..."
                                    value={formData.phone}
                                    onChange={updateField('phone')}
                                />
                            </label>

                            <label className="form-field form-field-full">
                                Email
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@email.com"
                                    value={formData.email}
                                    onChange={updateField('email')}
                                />
                            </label>

                            <label className="form-field form-field-full">
                                Notes (optional)
                                <textarea
                                    name="notes"
                                    rows="4"
                                    placeholder="Any details about your bike..."
                                    value={formData.notes}
                                    onChange={updateField('notes')}
                                />
                            </label>

                            <div className="form-actions">
                                <button type="button" className="book-back-btn" onClick={goBack}>
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="book-submit-btn"
                                    disabled={!formData.name || !formData.phone || !formData.email}
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default BookService;