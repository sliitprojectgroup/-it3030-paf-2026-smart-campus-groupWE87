import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyBooking } from '../services/api';

export default function VerifyBooking() {
    const { qrCode } = useParams();
    const [status, setStatus] = useState('loading');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const doVerify = async () => {
            try {
                const res = await verifyBooking(qrCode);
                setData(res);
                setStatus('success');
            } catch (err) {
                setError(err.response?.data?.message || 'Verification failed');
                setStatus('error');
            }
        };
        doVerify();
    }, [qrCode]);

    return (
        <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <h1 className="font-headline text-xl font-bold text-on-surface mb-2">Verifying...</h1>
                        <p className="font-body text-sm text-on-surface-variant">Please wait while we verify your booking.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-secondary text-[32px]">check_circle</span>
                        </div>
                        <h1 className="font-headline text-2xl font-bold text-on-surface mb-2">Check-in Successful</h1>
                        {data?.message ? (
                            <p className="font-body text-sm text-on-surface-variant">{data.message}</p>
                        ) : (
                            <div className="space-y-1 mt-4">
                                <p className="font-body text-sm text-on-surface-variant">
                                    Booking #{data?.id}
                                </p>
                                <p className="font-body text-sm text-on-surface-variant">
                                    {data?.date} | {data?.startTime?.substring(0, 5)} - {data?.endTime?.substring(0, 5)}
                                </p>
                                {data?.checkedInTime && (
                                    <p className="font-body text-xs text-on-surface-variant mt-2">
                                        Checked in at: {new Date(data.checkedInTime).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-error text-[32px]">cancel</span>
                        </div>
                        <h1 className="font-headline text-2xl font-bold text-on-surface mb-2">Check-in Failed</h1>
                        <p className="font-body text-sm text-on-surface-variant">{error}</p>
                    </>
                )}
            </div>
        </div>
    );
}
