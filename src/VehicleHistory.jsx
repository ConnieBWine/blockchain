import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    FiTool, 
    FiAlertTriangle, 
    FiUsers, 
    FiClock,
    FiMapPin,
    FiFile
} from 'react-icons/fi';
import axios from 'axios';
import './VehicleHistory.css';


const VehicleHistory = () => {
    const { vin } = useParams();
    const [history, setHistory] = useState({
        serviceRecords: [],
        accidentRecords: [],
        ownershipRecords: [],
        violationRecords: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`/api/vehicles/${vin}/history`);
                setHistory(response.data);
            } catch (error) {
                console.error('Error fetching vehicle history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [vin]);

    if (loading) {
        return <div className="loading-spinner">Loading history...</div>;
    }

    return (
        <div className="vehicle-history">
            <h2 className="history-title">Vehicle History</h2>

            {/* Service History Section */}
            <section className="history-section">
                <h3 className="section-title">
                    <FiTool className="section-icon" />
                    Service History
                </h3>
                <div className="timeline">
                    {history.serviceRecords.map((record, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-marker">
                                <FiTool />
                            </div>
                            <div className="timeline-content">
                                <h4>{record.serviceType}</h4>
                                <p>{record.description}</p>
                                <div className="timeline-info">
                                    <span>
                                        <FiClock /> {new Date(record.timestamp * 1000).toLocaleDateString()}
                                    </span>
                                    <span>
                                        <FiMapPin /> {record.serviceCenter}
                                    </span>
                                    <span>
                                        Mileage: {record.mileage.toLocaleString()} km
                                    </span>
                                </div>
                                {record.documentHash && (
                                    <a 
                                        href={`https://ipfs.io/ipfs/${record.documentHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="document-link"
                                    >
                                        <FiFile /> View Service Documentation
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Accident History Section */}
            <section className="history-section">
                <h3 className="section-title">
                    <FiAlertTriangle className="section-icon" />
                    Accident History
                </h3>
                <div className="timeline">
                    {history.accidentRecords.map((record, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-marker accident">
                                <FiAlertTriangle />
                            </div>
                            <div className="timeline-content">
                                <h4>Severity: {record.severity}</h4>
                                <p>{record.description}</p>
                                <div className="timeline-info">
                                    <span>
                                        <FiClock /> {new Date(record.timestamp * 1000).toLocaleDateString()}
                                    </span>
                                    {record.documentHash && (
                                        <a 
                                            href={`https://ipfs.io/ipfs/${record.documentHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="document-link"
                                        >
                                            <FiFile /> View Accident Report
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Ownership History Section */}
            <section className="history-section">
                <h3 className="section-title">
                    <FiUsers className="section-icon" />
                    Ownership History
                </h3>
                <div className="ownership-timeline">
                    {history.ownershipRecords.map((record, index) => (
                        <div key={index} className="ownership-item">
                            <div className="owner-info">
                                <span className="owner-address">
                                    {`${record.owner.substring(0, 6)}...${record.owner.substring(38)}`}
                                </span>
                                <span className="ownership-date">
                                    <FiClock /> {new Date(record.timestamp * 1000).toLocaleDateString()}
                                </span>
                            </div>
                            {record.documentHash && (
                                <a 
                                    href={`https://ipfs.io/ipfs/${record.documentHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="document-link"
                                >
                                    <FiFile /> View Transfer Documents
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default VehicleHistory;