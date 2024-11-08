import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { FiSearch, FiBookmark, FiMapPin, FiMessageSquare } from 'react-icons/fi';
import { useCars } from './CarContext';
import axios from 'axios';
import './Dashboard.css';
import Sidebar from './Sidebar';
import user from './assets/images/user_avatar.jpg';

// Message Service Class
class MessageService {
    constructor() {
        this.ws = null;
        this.subscribers = new Set();
    }

    connect(userId) {
        this.ws = new WebSocket(`${process.env.REACT_APP_WS_URL}?userId=${userId}`);
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.notifySubscribers(message);
        };

        this.ws.onclose = () => {
            setTimeout(() => this.connect(userId), 1000);
        };
    }

    sendMessage(recipientId, content) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'message',
                recipientId,
                content,
                timestamp: new Date().toISOString()
            }));
            return true;
        }
        return false;
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(message) {
        this.subscribers.forEach(callback => callback(message));
    }
}

// MessageModal Component
const MessageModal = ({ isOpen, onClose, recipientName, onSend }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSend(message);
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Message to {recipientName}</h3>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        className="message-textarea"
                    />
                    <div className="modal-buttons">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Send Message</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CarCard = ({ car }) => {
    const navigate = useNavigate();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [loading, setLoading] = useState(false);
    const messageService = new MessageService();

    const handleBookmarkClick = (e) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
    };

    const getImageUrl = (image) => {
        if (!image) return '';
        
        // If it's an object with url property
        if (typeof image === 'object' && image.url) {
            return `${axios.defaults.baseURL}${image.url}`;
        }
        
        // If it's a direct path
        if (typeof image === 'string') {
            return `${axios.defaults.baseURL}/uploads/vehicles/${car.id}/${image}`;
        }
        
        return '';
    };
    const handleCardClick = () => {
        if (car.id) {
            navigate(`/vehicle/${car.id}`, { 
                state: { 
                    carData: {
                        ...car,
                        images: car.images || [car.image]
                    } 
                } 
            });
        }
    };

    const handlePurchase = async (e) => {
        e.stopPropagation();
        if (!window.ethereum) {
            alert('Please install MetaMask to make purchases');
            return;
        }

        try {
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = provider.getSigner();

            const price = car.sale_type === 'auction' ? car.starting_bid : car.price;
            const tx = await signer.sendTransaction({
                to: car.seller?.address || car.owner_address,
                value: ethers.utils.parseEther(price.toString())
            });

            await tx.wait();
            alert('Purchase successful!');
            navigate(`/vehicle/${car.id}`);
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMessageSend = (content) => {
        if (!window.ethereum) {
            alert('Please install MetaMask to send messages');
            return;
        }
        messageService.sendMessage(car.seller?.id || car.id, content);
    };
    const getDisplayImage = () => {
        try {
            // For uploaded vehicles with images array
            if (car.images && car.images.length > 0) {
                const firstImage = car.images[0];
                
                // Handle image object with url property
                if (typeof firstImage === 'object' && firstImage.url) {
                    // Check if URL is already absolute
                    if (firstImage.url.startsWith('http')) {
                        return firstImage.url;
                    }
                    // Append API base URL
                    return `${axios.defaults.baseURL}${firstImage.url}`;
                }
                
                // Handle image path string
                if (typeof firstImage === 'string') {
                    if (firstImage.startsWith('/uploads')) {
                        return `${axios.defaults.baseURL}${firstImage}`;
                    }
                    return firstImage;
                }
            }

            // For predefined cars (from assets/images)
            if (car.image) {
                // Handle webpack imports
                if (typeof car.image === 'object' && car.image.default) {
                    return car.image.default;
                }
                
                // Handle direct image paths
                if (typeof car.image === 'string') {
                    if (car.image.startsWith('/uploads')) {
                        return `${axios.defaults.baseURL}${car.image}`;
                    }
                    return car.image;
                }
            }

            // Return public placeholder image if no valid image found
            return '/placeholder.jpg';
        } catch (error) {
            console.error('Error getting image for:', car.title || car.name, error);
            return '/placeholder.jpg';
        }
    };
    return (
        <div className="car-card" onClick={handleCardClick}>
            <div className="image-container">
                <img 
                    src={getDisplayImage()}
                    alt={car.title || car.name} 
                    className="car-image"
                    onError={(e) => {
                        console.error('Image load error for:', car.title || car.name);
                        e.target.src = `${process.env.PUBLIC_URL}/placeholder.jpg`;
                    }}
                />
            </div>
            <div className="car-info">
                <div className="car-header">
                    <h3>{car.title || car.name}</h3>
                    <FiBookmark 
                        className={`bookmark-icon ${isBookmarked ? 'active' : ''}`} 
                        onClick={handleBookmarkClick}
                    />
                </div>
                
                <div className="car-details">
                    <span>Style: {car.style}</span>
                    <span>Type: {car.type}</span>
                    <span>Color: {car.color}</span>
                    {car.transmission && <span>Transmission: {car.transmission}</span>}
                    {car.mileage && <span>Mileage: {car.mileage.toLocaleString()} km</span>}
                </div>

                <div className="price-section">
                    {car.sale_type === 'auction' ? (
                        <div className="auction-price">
                            <span className="starting-bid">
                                Starting Bid: ${car.starting_bid?.toLocaleString()}
                            </span>
                            {car.current_bid && (
                                <span className="current-bid">
                                    Current Bid: ${car.current_bid.toLocaleString()}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="fixed-price">
                            ${car.price?.toLocaleString()}
                        </div>
                    )}
                </div>
                
                <div className="car-actions">
                    <button 
                        onClick={handlePurchase}
                        disabled={loading}
                        className="purchase-button"
                    >
                        {loading ? 'Processing...' : (car.sale_type === 'auction' ? 'Place Bid' : 'Purchase')}
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMessage(true);
                        }}
                        className="message-button"
                    >
                        <FiMessageSquare /> Message Seller
                    </button>
                </div>

                <MessageModal
                    isOpen={showMessage}
                    onClose={() => setShowMessage(false)}
                    recipientName={car.seller?.name || 'Seller'}
                    onSend={handleMessageSend}
                />
            </div>
        </div>
    );
};

const FilterDropdown = ({ label, options, value, onChange }) => (
    <div className="filter-dropdown">
        <label>{label}</label>
        <select value={value} onChange={onChange}>
            {options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

const Dashboard = () => {
    const { cars } = useCars();  // Get predefined cars
    const [uploadedVehicles, setUploadedVehicles] = useState([]);
    const [theme, setTheme] = useState('light');
    const [filters, setFilters] = useState({
        search: '',
        style: '',
        priceRange: '',
        saleType: 'all'
    });
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    const processVehicles = (vehicles, source) => {
        return vehicles.map(vehicle => ({
            ...vehicle,
            uniqueId: `${source}-${vehicle.id || Math.random().toString(36).substr(2, 9)}`
        }));
    };
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get('/api/vehicles');
                // Transform the uploaded vehicles' image paths if needed
                const transformedVehicles = response.data.map(vehicle => ({
                    ...vehicle,
                    images: vehicle.images?.map(img => ({
                        ...img,
                        url: img.url.startsWith('http') ? 
                            img.url : 
                            `${axios.defaults.baseURL}${img.url}`
                    }))
                }));
                setUploadedVehicles(transformedVehicles);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            provider.listAccounts().then(accounts => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                }
            });
        }
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setWallet(address);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    // Combine both predefined and uploaded vehicles - only declare once
    const allVehicles = [
        ...processVehicles(cars, 'predefined'),
        ...processVehicles(uploadedVehicles, 'uploaded')
    ];
    const filteredVehicles = allVehicles.filter(vehicle => {
        const matchesSearch = !filters.search || 
            (vehicle.title || vehicle.name).toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesStyle = !filters.style || filters.style === 'All' || 
            vehicle.style === filters.style;
        
        const matchesSaleType = filters.saleType === 'all' || 
            vehicle.sale_type === filters.saleType;
        
        let matchesPrice = true;
        if (filters.priceRange && filters.priceRange !== 'All') {
            const [min, max] = filters.priceRange.split('-').map(Number);
            const price = vehicle.sale_type === 'auction' ? 
                vehicle.starting_bid : vehicle.price;
            matchesPrice = max ? 
                (price >= min && price <= max) :
                (price >= min);
        }

        return matchesSearch && matchesStyle && matchesPrice && matchesSaleType;
    });

    if (loading) {
        return <div className="loading">Loading vehicles...</div>;
    }

    return (
        <div className={`dashboard ${theme}`}>
            <Sidebar 
                toggleTheme={toggleTheme} 
                theme={theme} 
                user={{ name: "Smith", avatar: user }}
            />
            <div className="main-content">
                <div className="content-area">
                    <div className="dashboard-header">
                        <div>
                            <h1>Available Cars</h1>
                            <p>Browse and purchase vehicles</p>
                        </div>
                        {!wallet ? (
                            <button onClick={connectWallet} className="connect-wallet-btn">
                                Connect Wallet
                            </button>
                        ) : (
                            <div className="wallet-info">
                                Connected: {wallet.substring(0, 6)}...{wallet.substring(38)}
                            </div>
                        )}
                    </div>

                    <div className="filters-section">
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                            className="search-input"
                        />
                        <FilterDropdown
                            label="Style"
                            options={['All', 'SUV', 'Sedan', 'Sports']}
                            value={filters.style}
                            onChange={(e) => setFilters(prev => ({...prev, style: e.target.value}))}
                        />
                        <FilterDropdown
                            label="Price Range"
                            options={['All', '0-50000', '50000-100000', '100000+']}
                            value={filters.priceRange}
                            onChange={(e) => setFilters(prev => ({...prev, priceRange: e.target.value}))}
                        />
                        <FilterDropdown
                            label="Sale Type"
                            options={['all', 'fixed', 'auction']}
                            value={filters.saleType}
                            onChange={(e) => setFilters(prev => ({...prev, saleType: e.target.value}))}
                        />
                    </div>

                    <div className="car-grid">
                        {filteredVehicles.map((vehicle) => (
                            <CarCard 
                                key={vehicle.uniqueId} // Use the unique ID here
                                car={vehicle} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;