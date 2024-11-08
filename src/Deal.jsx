import React, { useState } from 'react';
import { FiMenu, FiSliders } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import './Deal.css';
import Sidebar from './Sidebar';
import user from './assets/images/user_avatar.jpg';
import Ava2 from './assets/images/user_avatar2.jpg';
import Ava3 from './assets/images/user_avatar3.jpg';

const Deal = () => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const [deals, setDeals] = useState([
    { id: '#1588965', owner: 'Albert Hussain', avatar: user, creationDate: '01 July, 2023', carType: 'Hyundai', returnDate: '03 July, 2023', type: 'Card', totalPrice: '$ 148.82' },
    { id: '#1588955', owner: 'Jonson Lee', avatar: Ava2, creationDate: '05 July, 2023', carType: 'Bentley', returnDate: '06 Aug, 2023', type: 'Cash', totalPrice: '$ 287.36' },
    { id: '#1588956', owner: 'Albert Hussain', avatar: Ava3, creationDate: '07 July, 2023', carType: 'Panamera', returnDate: '08 July, 2023', type: 'Cash', totalPrice: '$ 238.17' },
    { id: '#1588957', owner: 'Jonson Lee', avatar: Ava2, creationDate: '09 July, 2023', carType: 'Bentley', returnDate: '10 Aug, 2023', type: 'Card', totalPrice: '$ 287.36' },
    { id: '#1588958', owner: 'Alex Jahan', avatar: user, creationDate: '11 July, 2023', carType: 'Mercedes', returnDate: '12 Aug, 2023', type: 'Cash', totalPrice: '$ 258.32' },
    { id: '#1588959', owner: 'Smith Hasan', avatar: Ava3, creationDate: '16 July, 2023', carType: 'Hyundai', returnDate: '20 July, 2023', type: 'Card', totalPrice: '$ 124.24' },
    { id: '#1588960', owner: 'Jackson Kever', avatar: user, creationDate: '22 July, 2023', carType: 'Porsche', returnDate: '23 Aug, 2023', type: 'Cash', totalPrice: '$ 170.35' },
    { id: '#1588961', owner: 'Robert Luicce', avatar: Ava2, creationDate: '28 July, 2023', carType: 'Hyundai', returnDate: '30 Aug, 2023', type: 'Card', totalPrice: '$ 128.39' },
  ]);

  return (
    <div className={`deals ${theme}`}>
      <Sidebar toggleTheme={toggleTheme} theme={theme} user={{ name: "Smith", avatar: user }} />
      <div className="deals__main">
        <main className="deals__content">
          <div className="deals__container">
            <div className="deals__header">
              <div>
                <h1 className="deals__title">Deals</h1>
                <p className="deals__subtitle">Get your latest update for the last 7 days</p>
              </div>
              <button className="deals__export-btn">
                Export <FiMenu className="deals__export-icon" />
              </button>
            </div>
            <DealsTable deals={deals} />
          </div>
        </main>
      </div>
    </div>
  );
};

const DealsTable = ({ deals }) => (
  <div className="deals-table">
    <div className="deals-table__header">
      <h2 className="deals-table__title">Deals List</h2>
      <button className="deals-table__filter-btn">
        <FiSliders className="deals-table__filter-icon" />
        Filter by
      </button>
    </div>
    <table className="deals-table__table">
      <thead>
        <tr>
          <th>No.</th>
          <th>Owner Name</th>
          <th>Creation Date</th>
          <th>Car Type</th>
          <th>Return Date</th>
          <th>Type</th>
          <th>Total Price</th>
        </tr>
      </thead>
      <tbody>
        {deals.map((deal, index) => (
          <tr key={index}>
            <td>{deal.id}</td>
            <td>
              <div className="deals-table__owner">
                <img src={deal.avatar} alt={deal.owner} className="deals-table__owner-avatar" />
                {deal.owner}
              </div>
            </td>
            <td>{deal.creationDate}</td>
            <td>
              <div className="deals-table__car-type">
                <FaCar className="deals-table__car-icon" />
                {deal.carType}
              </div>
            </td>
            <td>{deal.returnDate}</td>
            <td>{deal.type}</td>
            <td className="deals-table__price">{deal.totalPrice}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Deal;