import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport, updateReport, postToX } from '../api/client.js';

export default function ReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminNote, setAdminNote] = useState('');
    const [actionLoading, setActionLoading] = useState('');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            const data = await getReport(id);
            setReport(data);
            setAdminNote(data.admin_note || '');
        } catch (err) {
            console.error('Failed to fetch report:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        setActionLoading(status);
        setMessage(null);
        try {
            const updated = await updateReport(id, { status, admin_note: adminNote || undefined });
            setReport(updated);
            setMessage({ type: 'success', text: `Report marked as ${status}` });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Update failed' });
        } finally {
            setActionLoading('');
        }
    };

    const handlePostToX = async () => {
        setActionLoading('x');
        setMessage(null);
        try {
            const result = await postToX(id);
            setMessage({ type: 'success', text: result.message });
            await fetchReport();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Post to X failed' });
        } finally {
            setActionLoading('');
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div>Loading report...</div>;
    }

    if (!report) {
        return (
            <div className="empty-state">
                <span className="material-icons-outlined">error_outline</span>
                <p>Report not found</p>
            </div>
        );
    }

    const mapsUrl = `https://maps.google.com/?q=${report.latitude},${report.longitude}`;

    return (
        <>
            <a className="back-link" onClick={() => navigate(-1)}>
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                Back to reports
            </a>

            <div className="page-header">
                <h2>Report Detail</h2>
                <p>Report ID: {report.id}</p>
            </div>

            {message && (
                <div className={`error-msg`} style={{
                    background: message.type === 'success' ? '#ecfdf5' : undefined,
                    color: message.type === 'success' ? '#047857' : undefined,
                    marginBottom: 20,
                }}>
                    {message.text}
                </div>
            )}

            <div className="detail-grid">
                {/* Left: Image & Map */}
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header">
                            <h3>📸 Evidence Photo</h3>
                        </div>
                        <div className="detail-image">
                            {report.image_url ? (
                                <img src={report.image_url} alt="Report evidence" />
                            ) : (
                                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                                    <span className="material-icons-outlined" style={{ fontSize: 48, color: '#cbd5e1' }}>image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3>📍 Location</h3>
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                                <span className="material-icons-outlined" style={{ fontSize: 16 }}>open_in_new</span>
                                Google Maps
                            </a>
                        </div>
                        <div className="card-body">
                            <div className="detail-field">
                                <div className="label">Address</div>
                                <div className="value">{report.address || 'Not available'}</div>
                            </div>
                            <div className="detail-field">
                                <div className="label">Coordinates</div>
                                <div className="value">{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Details */}
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header">
                            <h3>Report Information</h3>
                            <span className={`badge ${report.status}`}>{report.status}</span>
                        </div>
                        <div className="card-body">
                            <div className="detail-field">
                                <div className="label">Issue Type</div>
                                <div className="value" style={{ fontSize: 18, fontWeight: 600 }}>{report.issue_type}</div>
                            </div>
                            <div className="detail-field">
                                <div className="label">Description</div>
                                <div className="value">{report.description}</div>
                            </div>
                            <div className="detail-field">
                                <div className="label">Submitted</div>
                                <div className="value">
                                    {new Date(report.created_at).toLocaleString('en-US', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <div className="detail-field">
                                <div className="label">Posted to X</div>
                                <div className="value">
                                    {report.posted_to_x ? (
                                        <span style={{ color: '#10b981' }}>✅ Posted (ID: {report.x_post_id})</span>
                                    ) : (
                                        <span style={{ color: '#94a3b8' }}>Not posted</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Complaint Text */}
                    {report.complaint_text && (
                        <div className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header">
                                <h3>📄 Complaint Text</h3>
                            </div>
                            <div className="card-body">
                                <div className="complaint-box">{report.complaint_text}</div>
                            </div>
                        </div>
                    )}

                    {/* Admin Note */}
                    <div className="card">
                        <div className="card-header">
                            <h3>🛠️ Admin Actions</h3>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label htmlFor="admin-note">Admin Note</label>
                                <textarea
                                    id="admin-note"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Add a note about this report..."
                                    rows={3}
                                />
                            </div>

                            <div className="action-bar" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleUpdateStatus('resolved')}
                                    disabled={!!actionLoading || report.status === 'resolved'}
                                >
                                    {actionLoading === 'resolved' ? '...' : '✅ Mark Resolved'}
                                </button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleUpdateStatus('approved')}
                                    disabled={!!actionLoading || report.status === 'approved'}
                                >
                                    {actionLoading === 'approved' ? '...' : '👍 Approve'}
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleUpdateStatus('rejected')}
                                    disabled={!!actionLoading || report.status === 'rejected'}
                                >
                                    {actionLoading === 'rejected' ? '...' : '❌ Reject'}
                                </button>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={handlePostToX}
                                    disabled={!!actionLoading || report.posted_to_x}
                                >
                                    {actionLoading === 'x' ? '...' : '🐦 Post to X'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
