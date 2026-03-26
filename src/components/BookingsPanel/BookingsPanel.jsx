import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../../firebase';
import './BookingsPanel.css';

function BookingsPanel({ mode, currentUser }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState('');
  const [deletingBookingId, setDeletingBookingId] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [expandedBookingId, setExpandedBookingId] = useState('');

  useEffect(() => {
    if (!db || !currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const baseRef = collection(db, 'bookings');
    const bookingsQuery =
      mode === 'mine' ? query(baseRef, where('userId', '==', currentUser.uid)) : query(baseRef);

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const today = new Date().toISOString().slice(0, 10);

        const rows = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((booking) => (booking.date ?? '') >= today)
          .sort((a, b) => {
            const dateCompare = (a.date ?? '').localeCompare(b.date ?? '');
            if (dateCompare !== 0) return dateCompare;
            return (a.timeSlot ?? '').localeCompare(b.timeSlot ?? '');
          });

        setBookings(rows);
        setLoading(false);
      },
      () => {
        setErrorMessage('Could not load bookings.');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [mode, currentUser]);

  const heading = useMemo(
    () => (mode === 'admin' ? 'Upcoming Bookings' : 'My Bookings'),
    [mode],
  );

  const approveBooking = async (bookingId) => {
    if (!db || mode !== 'admin') return;

    setUpdatingBookingId(bookingId);

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: currentUser?.email ?? '',
      });
    } catch (error) {
      if (error?.code === 'permission-denied') {
        setErrorMessage('Could not approve booking: Firestore permissions denied this update.');
      } else {
        setErrorMessage('Could not approve booking.');
      }
    } finally {
      setUpdatingBookingId('');
    }
  };

  const removeBooking = async (bookingId) => {
    if (!db || mode !== 'admin') return;

    setDeletingBookingId(bookingId);

    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (error) {
      if (error?.code === 'permission-denied') {
        setErrorMessage('Could not remove booking: Firestore permissions denied this delete.');
      } else {
        setErrorMessage('Could not remove booking.');
      }
    } finally {
      setDeletingBookingId('');
    }
  };

  return (
    <section className="bookings-panel">
      <div className="bookings-header">
        <h2 className="bookings-title">{heading}</h2>
        {mode === 'admin' ? (
          <div className="bookings-view-toggle" role="group" aria-label="Booking layout">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('grid');
                setExpandedBookingId('');
              }}
            >
              Grid
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('list');
                setExpandedBookingId('');
              }}
            >
              List
            </button>
          </div>
        ) : null}
      </div>

      {loading ? <p className="bookings-meta">Loading bookings...</p> : null}
      {errorMessage ? <p className="bookings-meta bookings-error">{errorMessage}</p> : null}

      {!loading && !errorMessage && bookings.length === 0 ? (
        <p className="bookings-meta">No bookings found.</p>
      ) : null}

      <div className={`bookings-grid ${viewMode === 'list' ? 'bookings-list' : ''}`}>
        {bookings.map((booking) => (
          <article
            key={booking.id}
            className={`booking-card ${
              viewMode === 'list' && expandedBookingId === booking.id
                ? 'list-expanded'
                : viewMode === 'list'
                  ? 'list-collapsed'
                  : ''
            }`}
            onClick={
              viewMode === 'list'
                ? () =>
                    setExpandedBookingId((prev) =>
                      prev === booking.id ? '' : booking.id,
                    )
                : undefined
            }
          >
            <div className="booking-card-main">
              <div className="booking-card-header">
                <h3>
                  {Array.isArray(booking.services) && booking.services.length > 0
                    ? booking.services.map((service) => service.replace('-', ' ')).join(', ')
                    : booking.serviceType?.replace('-', ' ') ?? 'Service'}
                </h3>
                {viewMode === 'list' ? (
                  <span className="booking-expand-hint">
                    {expandedBookingId === booking.id ? 'Collapse' : 'Expand'}
                  </span>
                ) : null}
              </div>

              {viewMode !== 'list' || expandedBookingId === booking.id ? (
                <>
                  <p>
                    <strong>Date:</strong> {booking.date || '-'}
                  </p>
                  <p>
                    <strong>Time:</strong> {booking.timeSlot || '-'}
                  </p>
                  <p>
                    <strong>Name:</strong> {booking.name || '-'}
                  </p>
                  <p>
                    <strong>Phone:</strong> {booking.phone || '-'}
                  </p>
                  <p>
                    <strong>Email:</strong> {booking.email || booking.userEmail || '-'}
                  </p>
                  {booking.notes ? (
                    <p>
                      <strong>Notes:</strong> {booking.notes}
                    </p>
                  ) : null}
                  {typeof booking.approximateTotal === 'number' ? (
                    <p>
                      <strong>Approx. Total:</strong> €{booking.approximateTotal.toFixed(2)}
                    </p>
                  ) : null}
                </>
              ) : null}

              <p className="booking-status">Status: {booking.status || 'pending'}</p>
            </div>

            {mode === 'admin' ? (
              <div className="booking-admin-actions">
                <button
                  type="button"
                  className="booking-approve-btn"
                  disabled={
                    booking.status === 'approved' ||
                    updatingBookingId === booking.id ||
                    deletingBookingId === booking.id
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    approveBooking(booking.id);
                  }}
                >
                  {booking.status === 'approved'
                    ? 'Approved'
                    : updatingBookingId === booking.id
                      ? 'Approving...'
                      : 'Approve'}
                </button>

                <button
                  type="button"
                  className="booking-remove-btn"
                  disabled={deletingBookingId === booking.id || updatingBookingId === booking.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeBooking(booking.id);
                  }}
                >
                  {deletingBookingId === booking.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default BookingsPanel;
