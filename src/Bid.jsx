import React, { useState } from 'react';
import { FiSearch, FiBell, FiMenu, FiCalendar, FiDollarSign, FiTruck, FiBarChart2, FiRepeat, FiSettings, FiHelpCircle, FiMapPin, FiBookmark } from 'react-icons/fi';
import './Bid.css';
import Sidebar from './Sidebar';

import Audi1 from "./assets/images/Audi1.jpg";
import Ducati1 from './assets/images/speed_triple.jpg';
import Z1000 from './assets/images/z1000.jpg';
import Supra1 from './assets/images/supra.jpg';
import F40 from './assets/images/f40.jpg';
import F8 from './assets/images/ferrari_f8.jpg';
import H2 from './assets/images/H2.jpg';
import jeep1 from './assets/images/jeep1.jpg';
import user from './assets/images/user_avatar.jpg';
import Lamborghini from './assets/images/Lambo1.jpg';
import Bentley1 from './assets/images/bentley1.jpg';
import Rx7 from './assets/images/rx7.jpg';
import Triumph from './assets/images/Triumph.jpg';
import Range_Rover from './assets/images/range_rover1.jpg';
import Vitpilen401 from './assets/images/Vitpilen401.jpg';
import Duke390 from './assets/images/Duke390.jpg';
import RC390 from './assets/images/rc390.jpg';
import superduke1390 from './assets/images/superduke1390.jpg';
import Husqvarna701 from './assets/images/Husqvarna701.jpg';
import ZX10r from './assets/images/zx10r.jpg';
import Z900 from './assets/images/z900.jpg';
import w650 from './assets/images/w650.jpg';
import G800 from './assets/images/G800.jpg';
import G700 from './assets/images/G700.jpg';
import G650 from './assets/images/G650.jpg';
import Cirrus from './assets/images/CirrusVision.jpg';
import Cobalt from './assets/images/colbalt.jpg';

const AuctionCard = ({ car }) => (
  <div className="auction-card">
    <img src={car.image} alt={car.name} />
    <div className="car-info">
      <div className="car-header">
        <h3>{car.name}</h3>
        <FiBookmark className="bookmark-icon" />
      </div>
      <div className="car-location">
        <FiMapPin /> {car.location}
      </div>
      <div className="car-details">
        <span>Style: {car.style}</span>
        <span>RTO: {car.rto}</span>
        <span>Spend: {car.spend}</span>
      </div>
      <div className="car-prices">
        <span className="current-price">${car.currentPrice.toLocaleString()}</span>
        <span className="bid-price">$ {car.bidPrice.toLocaleString()}</span>
      </div>
      <button className="bid-button">Bid Now</button>
    </div>
  </div>
);

const ActiveBids = () => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const cars = [
  { name: "Ferrari F40", location: "Maranello, Italy", style: 'Ferrari', rto: 'IT05', spend: '6.1km/l', currentPrice: 170283, bidPrice: 3500000, image: F40 },
  { name: "KTM Duke 390", location: "Mattighofen, Austria", style: 'Naked Streetfighter', rto: 'AT02', spend: '28.5km/l', currentPrice: 5500, bidPrice: 5000, image: Duke390 },
  { name: "Gulfstream G800", location: "Savannah, USA", style: 'Business Jet', rto: 'US09', spend: '0.35km/l', currentPrice: 71500000, bidPrice: 70000000, image: G800 },
  { name: "Kawasaki Z1000", location: "Tokyo, Japan", style: 'Kawasaki', rto: 'JP03', spend: '18.7km/l', currentPrice: 140280, bidPrice: 128000, image: Z1000 },
  { name: "Range Rover Sport", location: "Solihull, UK", style: 'Land Rover', rto: 'UK13', spend: '7.9km/l', currentPrice: 320000, bidPrice: 295000, image: Range_Rover },
  { name: "Husqvarna Vitpilen", location: "Gothenburg, Sweden", style: 'Modern Cafe Racer', rto: 'SE01', spend: '30.2km/l', currentPrice: 3500, bidPrice: 3200, image: Vitpilen401 },
  { name: "Bentley Continental GT", location: "Crewe, UK", style: 'Bentley', rto: 'UK10', spend: '9.7km/l', currentPrice: 380000, bidPrice: 350000, image: Bentley1 },
  { name: "Kawasaki ZX10r", location: "Akashi, Japan", style: 'Super Sport', rto: 'JP06', spend: '16.2km/l', currentPrice: 16800, bidPrice: 15500, image: ZX10r },
  { name: "Cirrus Vision Jet", location: "Duluth, USA", style: 'Personal Jet', rto: 'US12', spend: '0.45km/l', currentPrice: 2000000, bidPrice: 1850000, image: Cirrus },
  { name: "Toyota Supra", location: "Nagoya, Japan", style: 'Toyota', rto: 'JP04', spend: '10.2km/l', currentPrice: 281320, bidPrice: 255000, image: Supra1 },
  { name: "KTM RC390", location: "Mattighofen, Austria", style: 'Sports', rto: 'AT03', spend: '26.8km/l', currentPrice: 5800, bidPrice: 5300, image: RC390 },
  { name: "Lamborghini Aventador", location: "Sant'Agata Bolognese, Italy", style: 'Lamborghini', rto: 'IT09', spend: '5.3km/l', currentPrice: 450000, bidPrice: 420000, image: Lamborghini },
  { name: "Kawasaki W650", location: "Akashi, Japan", style: 'Classic Retro', rto: 'JP08', spend: '24.5km/l', currentPrice: 7500, bidPrice: 6800, image: w650 },
  { name: "Gulfstream G700", location: "Savannah, USA", style: 'Business Jet', rto: 'US10', spend: '0.38km/l', currentPrice: 75000000, bidPrice: 73500000, image: G700 },
  { name: "Audi R8 Green", location: "Munich, Germany", style: 'Audi', rto: 'DE01', spend: '12.5km/l', currentPrice: 285892, bidPrice: 260000, image: Audi1 },
  { name: "Kawasaki Ninja H2", location: "Akashi, Japan", style: 'Kawasaki', rto: 'JP07', spend: '17.2km/l', currentPrice: 159999, bidPrice: 145000, image: H2 },
  { name: "Colbalt Valkyrie X", location: "San Francisco, USA", style: 'Light Aircraft', rto: 'US13', spend: '0.42km/l', currentPrice: 1500000, bidPrice: 1400000, image: Cobalt },
  { name: "Ducati Speed Triple", location: "Bologna, Italy", style: 'Ducati', rto: 'IT02', spend: '20.1km/l', currentPrice: 140328, bidPrice: 125000, image: Ducati1 },
  { name: "KTM Superduke 1390", location: "Mattighofen, Austria", style: 'Hyper Naked', rto: 'AT04', spend: '15.6km/l', currentPrice: 19500, bidPrice: 18000, image: superduke1390 },
  { name: "Mazda RX-7", location: "Hiroshima, Japan", style: 'Mazda', rto: 'JP11', spend: '11.2km/l', currentPrice: 175000, bidPrice: 160000, image: Rx7 },
  { name: "Ferrari F8", location: "Maranello, Italy", style: 'Ferrari', rto: 'IT06', spend: '7.8km/l', currentPrice: 140158, bidPrice: 2800000, image: F8 },
  { name: "Gulfstream G650", location: "Savannah, USA", style: 'Business Jet', rto: 'US11', spend: '0.40km/l', currentPrice: 65000000, bidPrice: 63500000, image: G650 },
  { name: "Husqvarna 701", location: "Gothenburg, Sweden", style: 'Supermoto', rto: 'SE05', spend: '22.4km/l', currentPrice: 11500, bidPrice: 10800, image: Husqvarna701 },
  { name: "Jeep Wrangler", location: "Toledo, USA", style: 'Jeep', rto: 'US08', spend: '8.4km/l', currentPrice: 210500, bidPrice: 195000, image: jeep1 },
  { name: "Kawasaki Z900", location: "Akashi, Japan", style: 'Naked Sport', rto: 'JP07', spend: '19.8km/l', currentPrice: 9200, bidPrice: 8500, image: Z900 },
  { name: "Triumph Street Triple", location: "Hinckley, UK", style: 'Triumph', rto: 'UK12', spend: '21.5km/l', currentPrice: 135000, bidPrice: 120000, image: Triumph }
  ];

  return (
    <div className={`active-bids ${theme}`}>
      {/* <Header toggleTheme={toggleTheme} theme={theme} /> */}
      <div className="main-content">
        <Sidebar toggleTheme={toggleTheme} theme={theme} user={{ name: "Smith", avatar: user }} />
        <div className="content-area">
          <div className="bids-header">
            <div>
              <h1>Active Bids</h1>
              <p>Get your latest update for the last 7 days</p>
            </div>
            <button className="filter-btn">Filter by</button>
          </div>
          <div className="auction-section">
            <h2>Auction</h2>
            <div className="auction-grid">
              {cars.map((car, index) => (
                <AuctionCard key={index} car={car} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveBids;