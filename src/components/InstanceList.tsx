import React, { useState, useEffect } from 'react';
import {
    listGcpInstances,
    listAwsInstances,
    deleteGcpInstance,
    deleteAwsInstance,
    type Instance
} from '../services/api';

export default function InstanceList() {
    const [gcpInstances, setGcpInstances] = useState<Instance[]>([]);
    const [awsInstances, setAwsInstances] = useState<Instance[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // Load GCP
                const gcpRes = await listGcpInstances();
                if (gcpRes.success) {
                    setGcpInstances(gcpRes.instances || []);
                }

                // Load AWS
                const awsRes = await listAwsInstances();
                // AWS endpoint returns array directly or wrapped?
                // Based on api.ts: return data.instance_types || [] for types, but for list?
                // Let's check api.ts again. listAwsInstances returns ListResponse.
                // Backend: api_all_list returns {aws: [...], gcp: [...]} OR api_aws_list_get returns {success, count, instances}
                // My api.ts calls /api/aws/list (which maps to api_aws_list_get in backend)
                if (awsRes.success) {
                    setAwsInstances(awsRes.instances || []);
                }
            } catch (err) {
                console.error("Failed to load instances", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [refreshKey]);

    const refresh = () => setRefreshKey(k => k + 1);

    const handleDeleteGcp = async (name: string, zone?: string) => {
        if (!confirm(`Delete GCP instance ${name}?`)) return;
        try {
            await deleteGcpInstance(name, zone);
            refresh();
        } catch (err) {
            alert("Failed to delete instance");
        }
    };

    const handleDeleteAws = async (id: string, region?: string) => {
        if (!confirm(`Delete AWS instance ${id}?`)) return;
        try {
            await deleteAwsInstance(id, region);
            refresh();
        } catch (err) {
            alert("Failed to delete instance");
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Active Instances</h2>
                <button
                    onClick={refresh}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                    Refresh
                </button>
            </div>

            {loading && <p className="text-gray-500 text-center py-4">Loading instances...</p>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* GCP List */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">GCP Instances</h3>
                    {gcpInstances.length === 0 ? (
                        <p className="text-gray-400 italic">No active instances found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {gcpInstances.map((inst, idx) => (
                                <li key={idx} className="border rounded-md p-3 hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{inst.name}</p>
                                            <p className="text-xs text-gray-500">{inst.zone} | {inst.machine_type}</p>
                                            <p className="text-xs text-gray-500">IP: {inst.external_ips?.join(', ') || 'None'}</p>
                                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${inst.status === 'RUNNING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {inst.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteGcp(inst.name, inst.zone)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* AWS List */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-orange-500 border-b pb-2">AWS Instances</h3>
                    {awsInstances.length === 0 ? (
                        <p className="text-gray-400 italic">No active instances found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {awsInstances.map((inst, idx) => (
                                <li key={idx} className="border rounded-md p-3 hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{inst.Name || inst.InstanceId}</p>
                                            <p className="text-xs text-gray-500">{inst.InstanceId}</p>
                                            <p className="text-xs text-gray-500">IP: {inst.PublicIpAddress || 'None'}</p>
                                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${inst.State?.Name === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {inst.State?.Name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => inst.InstanceId && handleDeleteAws(inst.InstanceId)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
