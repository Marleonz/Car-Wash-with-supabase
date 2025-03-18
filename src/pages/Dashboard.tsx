import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  vehicle_type: string;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service: {
    name: string;
    price: number;
  };
  vehicle: Vehicle;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id);

        if (vehiclesError) throw vehiclesError;
        setVehicles(vehiclesData || []);

        // Fetch bookings with service and vehicle details
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            service:service_id (
              name,
              price
            ),
            vehicle:vehicle_id (
              brand,
              model,
              plate_number,
              vehicle_type
            )
          `)
          .eq('user_id', user.id)
          .order('booking_date', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/booking')}
            className="flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-6 h-6 mr-2" />
            <span className="text-lg font-semibold">Book New Service</span>
          </button>
          <button
            onClick={() => navigate('/vehicles/new')}
            className="flex items-center justify-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Car className="w-6 h-6 mr-2" />
            <span className="text-lg font-semibold">Add New Vehicle</span>
          </button>
        </div>

        {/* Vehicles Section */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Car className="w-6 h-6 mr-2 text-blue-600" />
            Your Vehicles
          </h2>
          {vehicles.length === 0 ? (
            <p className="text-gray-600">No vehicles registered yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-gray-600">{vehicle.plate_number}</p>
                  <p className="text-sm text-gray-500">{vehicle.vehicle_type}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bookings Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-600" />
            Recent Bookings
          </h2>
          {bookings.length === 0 ? (
            <p className="text-gray-600">No bookings found.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{booking.service.name}</h3>
                      <p className="text-gray-600">
                        {booking.vehicle.brand} {booking.vehicle.model} - {booking.vehicle.plate_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString()} at{' '}
                        {booking.booking_time}
                      </p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}