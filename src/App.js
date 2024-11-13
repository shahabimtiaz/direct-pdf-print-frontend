import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { MdPrint } from 'react-icons/md'; // Importing a printer icon from React Icons
import { FaExclamationCircle, FaCheckCircle, FaCog, FaQuestionCircle } from 'react-icons/fa'; // For representing icons

const styles = {
    container: {
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    heading: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '15px',
        textAlign: 'center',
    },
    paragraph: {
        fontSize: '16px',
        color: '#555',
        marginBottom: '20px',
    },
    list: {
        listStyleType: 'none',
        paddingLeft: '0',
        fontSize: '16px',
    },
    listItem: {
        marginBottom: '8px',
    },
    button: {
        padding: '12px 20px',
        marginTop: '10px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    printerBox: {
        marginTop: '20px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    selectLabel: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
    },
    printerGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '15px',
        marginTop: '15px',
    },
    printerButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 10px',
        fontSize: '14px',
        backgroundColor: '#f0f0f0',
        color: '#333',
        border: '1px solid #ccc',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.3s, transform 0.3s',
        flexDirection: 'column',
    },
    printerButtonSelected: {
        backgroundColor: '#4CAF50',
        color: 'white',
        transform: 'scale(1.05)',
    },
    printerIcon: {
        fontSize: '24px',
        marginBottom: '5px',
    },
    loadingText: {
        marginTop: '10px',
        color: '#666',
    },
    successMessage: {
        color: 'green',
        fontWeight: 'bold',
    },
    errorMessage: {
        color: 'red',
        fontWeight: 'bold',
    },
    infoMessage: {
        color: '#555',
        fontStyle: 'italic',
    }
};

// Function to map icon name to React icon component
const getStatusIcon = (icon) => {
    switch (icon) {
        case 'unknown':
            return <FaQuestionCircle style={{ color: '#888' }} />;
        case 'degraded':
            return <FaExclamationCircle style={{ color: 'orange' }} />;
        case 'ready':
            return <FaCheckCircle style={{ color: 'green' }} />;
        case 'offline':
            return <FaExclamationCircle style={{ color: 'red' }} />;
        default:
            return <FaQuestionCircle style={{ color: '#888' }} />;
    }
};

const PrintReceipt = () => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [printers, setPrinters] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState('');
    const [printStatus, setPrintStatus] = useState(null); // For feedback messages

    useEffect(() => {
        // Fetch available printers from the server
        fetch('http://localhost:3001/printers')
            .then(response => response.json())
            .then(data => {
                setPrinters(data.printers);
                if (data.printers.length > 0) {
                    setSelectedPrinter(data.printers[0].name);  // Default to the first printer
                }
            })
            .catch(error => {
                console.log('Error fetching printers:', error);
                setPrintStatus({
                    type: 'error',
                    message: 'Unable to fetch printer list. Please try again later.'
                });
            });
    }, []);

    const sendPDFToServer = (pdfData) => {
        if (!selectedPrinter) {
            return false;  // If no printer is selected, do not proceed
        }

        const base64PDF = btoa(String.fromCharCode.apply(null, new Uint8Array(pdfData)));

        fetch('http://localhost:3001/print-receipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pdfData: base64PDF, printer: selectedPrinter })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setPrintStatus({
                        type: 'success',
                        message: `Receipt successfully printed on ${selectedPrinter}!`
                    });
                } else {
                    setPrintStatus({
                        type: 'error',
                        message: data.message || 'Failed to print the receipt. Please try again.'
                    });
                }
            })
            .catch(error => {
                console.error('Error printing receipt:', error);
                setPrintStatus({
                    type: 'error',
                    message: 'An error occurred while printing the receipt. Please try again.'
                });
            });
    };

    const generateReceipt = () => {
        setIsPrinting(true);
        setPrintStatus({ type: 'info', message: 'Generating receipt and preparing for printing...' });

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 100],  // Custom size for receipt
        });

        // Add content to the PDF (could be dynamic based on app data)
        doc.setFontSize(9);
        doc.text("Receipt", 10, 10);
        doc.text("Item: Product A", 10, 20);
        doc.text("Price: $100", 10, 30);
        doc.text("Thank you for your purchase!", 10, 40);

        const pdfData = doc.output('arraybuffer');
        sendPDFToServer(pdfData);

        setIsPrinting(false);
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Receipt Printer</h2>
            <p style={styles.paragraph}>Your purchase details:</p>
            <ul style={styles.list}>
                <li style={styles.listItem}>Item: Product A</li>
                <li style={styles.listItem}>Price: $100</li>
            </ul>

            <div style={styles.printerBox}>
                <label htmlFor="printerSelect" style={styles.selectLabel}>
                    Select Printer:
                </label>
                <div style={styles.printerGrid}>
                    {printers.map((printer, index) => (
                        <div key={index}>
                            <button
                                onClick={() => setSelectedPrinter(printer.name)}
                                style={{
                                    ...styles.printerButton,
                                    ...(selectedPrinter === printer.name && styles.printerButtonSelected),
                                }}
                            >
                                <MdPrint style={styles.printerIcon} />
                                {printer.name}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {getStatusIcon(printer.status.icon)}
                                <p>{printer.status.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={generateReceipt}
                disabled={isPrinting}
                style={{ ...styles.button, ...(isPrinting && styles.buttonDisabled) }}
            >
                {isPrinting ? 'Printing...' : 'Print Receipt'}
            </button>

            {printStatus && (
                <div style={styles.loadingText}>
                    <p style={printStatus.type === 'success' ? styles.successMessage : 
                        printStatus.type === 'error' ? styles.errorMessage : styles.infoMessage}>
                        {printStatus.message}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PrintReceipt;
