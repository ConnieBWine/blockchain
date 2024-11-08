import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { FiUpload } from 'react-icons/fi';
import { CONFIG } from './config';
import VehicleHistoryABI from './VehicleHistory.json';
import axios from 'axios';
import ErrorBoundary from './ErrorBoundary';
import Sidebar from './Sidebar';
import './ServiceRecordForm.css';
import userAvatar from './assets/images/user_avatar.jpg';  // Make sure this path is correct
const ServiceRecordForm = () => {
    const { vin } = useParams();
    const navigate = useNavigate();
     // Add user state
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [formData, setFormData] = useState({
        serviceType: '',
        description: '',
        mileage: '',
        documents: []
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    // ServiceRecordForm.jsx - add these handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear any previous errors
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            documents: files
        }));
        setError(''); // Clear any previous errors
    };
    // Initialize Web3 and contract
    useEffect(() => {
        // Redirect if no user is logged in
        if (!user) {
            navigate('/login');
            return;
        }
        // Add this to ServiceRecordForm.jsx
    const checkNetworkAndContract = async (provider) => {
        const network = await provider.getNetwork();
        console.log('Current network:', network);

        if (network.chainId !== 1337) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x539' }]
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [CONFIG.NETWORK_PARAMS]
                    });
                } else {
                    throw switchError;
                }
            }
        }

        // Verify contract code exists
        const code = await provider.getCode(CONFIG.VEHICLE_HISTORY_CONTRACT_ADDRESS);
        if (code === '0x') {
            throw new Error('Contract not deployed at specified address');
        }
    };
    // ServiceRecordForm.jsx - update the initializeContract function in useEffect
    const initializeContract = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('Please install MetaMask to use this feature');
            }

            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts',
                params: []
            });

            // Configure provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Get the network
            const network = await provider.getNetwork();
            console.log('Connected to network:', network.chainId);

            // Verify we're on the correct network (Ganache)
            if (network.chainId !== 1337) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x539' }], // 1337 in hex
                });
            }

            const signer = provider.getSigner();
            
            // Verify contract address and ABI
            if (!CONFIG.VEHICLE_HISTORY_CONTRACT_ADDRESS) {
                throw new Error('Contract address not configured');
            }

            // Initialize contract with proper error handling
            const vehicleHistoryContract = new ethers.Contract(
                CONFIG.VEHICLE_HISTORY_CONTRACT_ADDRESS,
                VehicleHistoryABI,
                signer
            );

            // Verify contract is deployed
            const code = await provider.getCode(CONFIG.VEHICLE_HISTORY_CONTRACT_ADDRESS);
            if (code === '0x') {
                throw new Error('Contract not deployed at specified address');
            }

            const isAuthorized = await vehicleHistoryContract.isServiceCenterAuthorized(accounts[0]);
            console.log('Is account authorized:', isAuthorized);

            if (!isAuthorized) {
                // Check if account is contract owner
                const contractOwner = await vehicleHistoryContract.owner();
                if (contractOwner.toLowerCase() === accounts[0].toLowerCase()) {
                    console.log('Authorizing service center...');
                    const tx = await vehicleHistoryContract.authorizeServiceCenter(accounts[0], {
                        gasLimit: ethers.utils.hexlify(100000)
                    });
                    await tx.wait();
                    console.log('Self-authorization successful');
                    setIsAuthorized(true);
                } else {
                    throw new Error('Account is not authorized as a service center');
                }
            }

            // Set state
            setAccount(accounts[0]);
            setContract(vehicleHistoryContract);
            setIsAuthorized(true);

            // Event listeners
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });

            window.ethereum.on('accountsChanged', (newAccounts) => {
                if (newAccounts.length === 0) {
                    setAccount(null);
                    setIsAuthorized(false);
                } else {
                    setAccount(newAccounts[0]);
                    // Re-check authorization
                    vehicleHistoryContract.isServiceCenterAuthorized(newAccounts[0])
                        .then(setIsAuthorized)
                        .catch(console.error);
                }
            });

        } catch (err) {
            console.error('Initialization error:', err);
            setError(err.message || 'Failed to initialize Web3 connection');
            throw err;
        }
    };

        initializeContract();

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('chainChanged', () => {});
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, [user, navigate]);

// ServiceRecordForm.jsx - update the handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setIsProcessing(true);

        try {
            if (!contract || !account) {
                throw new Error('Web3 not initialized');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Network check
            const network = await provider.getNetwork();
            console.log('Connected network:', network);

            // Format data
            const cleanVin = vin.trim();
            const mileageValue = ethers.BigNumber.from(formData.mileage.toString());

            // First try normal transaction
            try {
                // Create transaction object
                const tx = await contract.populateTransaction.addServiceRecord(
                    cleanVin,
                    formData.serviceType.trim(),
                    formData.description.trim(),
                    mileageValue,
                    ''
                );

                // Add gas parameters
                const gasEstimate = await provider.estimateGas({
                    ...tx,
                    from: account
                });

                const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
                const gasPrice = await provider.getGasPrice();

                // Send transaction
                const signedTx = await signer.sendTransaction({
                    ...tx,
                    gasLimit: gasLimit,
                    gasPrice: gasPrice
                });

                console.log('Transaction sent:', signedTx.hash);
                setError('Transaction pending. Please wait for confirmation...');

                // Wait for confirmation
                const receipt = await signedTx.wait();
                console.log('Transaction confirmed:', receipt);

                // Submit to backend
                const formDataToSend = new FormData();
                formDataToSend.append('serviceType', formData.serviceType.trim());
                formDataToSend.append('description', formData.description.trim());
                formDataToSend.append('mileage', formData.mileage);

                formData.documents.forEach(doc => {
                    formDataToSend.append('documents', doc);
                });

                const response = await axios.post(
                    `/api/vehicles/${cleanVin}/service-records`,
                    formDataToSend,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (response.data.success) {
                    setSuccess(true);
                    setFormData({
                        serviceType: '',
                        description: '',
                        mileage: '',
                        documents: []
                    });
                    setTimeout(() => navigate(`/vehicle/${cleanVin}/history`), 2000);
                }

            } catch (txError) {
                console.error('Transaction error:', txError);
                
                // Try with higher gas limit if first attempt failed
                const tx = await contract.addServiceRecord(
                    cleanVin,
                    formData.serviceType.trim(),
                    formData.description.trim(),
                    mileageValue,
                    '',
                    {
                        gasLimit: 500000,
                        gasPrice: await provider.getGasPrice()
                    }
                );

                console.log('Retrying with higher gas limit:', tx.hash);
                const receipt = await tx.wait();
                console.log('Transaction successful:', receipt);
            }

        } catch (error) {
            console.error('Submission error:', error);
            let errorMessage = 'Transaction failed. ';
            
            if (error.code === 'ACTION_REJECTED') {
                errorMessage = 'Transaction was rejected in MetaMask';
            } else if (error.code === 'INSUFFICIENT_FUNDS') {
                errorMessage = 'Insufficient funds for transaction';
            } else if (error.error?.message) {
                errorMessage += error.error.message;
            } else {
                errorMessage += error.message || 'Unknown error occurred';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
            setIsProcessing(false);
        }
    };
    return (
        <ErrorBoundary>
            <div className="flex min-h-screen bg-gray-100">
                {/* <Sidebar
                toggleTheme={toggleTheme} 
                    theme={theme} 
                    user={{
                        name: user?.name || "Guest",
                        avatar: userAvatar // Use the imported avatar
                    }}
                /> */}
                <div className="flex-1 p-8">
                    <div className="service-record-container">
            <div className="service-record-box">
                <div className="service-record-header">
                    <h2 className="service-record-title">Add Service Record</h2>
                    <p className="service-record-subtitle">VIN: {vin}</p>
                </div>

                <form onSubmit={handleSubmit} className="service-record-form">
                    <div className="form-group">
                        <label>Service Type</label>
                        <input
                            type="text"
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleInputChange}
                            required
                            disabled={isProcessing}
                            placeholder="e.g., Oil Change, Brake Service, etc."
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            disabled={isProcessing}
                            placeholder="Detailed description of the service performed..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Current Mileage (km)</label>
                        <input
                            type="number"
                            name="mileage"
                            value={formData.mileage}
                            onChange={handleInputChange}
                            required
                            disabled={isProcessing}
                            min="0"
                            placeholder="Current vehicle mileage"
                        />
                    </div>

                    <div className="form-group">
                        <label>Supporting Documents</label>
                        <div className="upload-section">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                id="document-upload"
                                className="hidden"
                                disabled={isProcessing}
                            />
                            <label htmlFor="document-upload" className="upload-label">
                                <FiUpload className="upload-icon" />
                                <span>Click to upload documents</span>
                            </label>
                            {formData.documents.length > 0 && (
                                <div className="file-list">
                                    {formData.documents.map((file, index) => (
                                        <div key={index} className="file-item">
                                            {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                {error && <div className="error-message">
                    {typeof error === 'string' ? (
                        error.startsWith('Transaction pending') ? (
                            <div className="transaction-pending">
                                <p>Transaction is pending...</p>
                                <p className="transaction-hash">{error.split('Hash: ')[1]}</p>
                                <p>Please wait for confirmation in MetaMask</p>
                            </div>
                        ) : error
                    ) : 'An error occurred'}
                </div>}

                {success && <div className="success-message">Service record added successfully!</div>}

                <button
                    type="submit"
                    className="submit-button"
                    disabled={isProcessing || !account || !isAuthorized}
                >
                    {isProcessing ? (
                        <div className="processing-state">
                            <span>Processing...</span>
                            <span className="processing-details">
                                {loading ? 'Waiting for MetaMask confirmation...' : 'Submitting to blockchain...'}
                            </span>
                        </div>
                    ) : 'Add Service Record'}
                </button>
                </form>
                </div>
                </div>
                </div>
                </div>

        </ErrorBoundary>
    );
};

export default ServiceRecordForm;