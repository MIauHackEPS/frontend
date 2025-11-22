import React, { useState, useEffect } from 'react';
import {
  getGcpInstanceTypes,
  getAwsInstanceTypes,
  createGcpInstance,
  createAwsInstance,
  type GcpInstanceType,
  type AwsInstanceType
} from '../services/api';

export default function NodeCreator() {
  const [provider, setProvider] = useState<'gcp' | 'aws'>('gcp');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Common state
  const [count, setCount] = useState(1);
  const [password, setPassword] = useState('');

  // GCP state
  const [gcpZone, setGcpZone] = useState('europe-west1-b');
  const [gcpCpus, setGcpCpus] = useState(2);
  const [gcpRam, setGcpRam] = useState(4);
  const [gcpTypes, setGcpTypes] = useState<GcpInstanceType[]>([]);
  const [gcpSelectedType, setGcpSelectedType] = useState('');
  const [gcpImageProject, setGcpImageProject] = useState('ubuntu-os-cloud');
  const [gcpImageFamily, setGcpImageFamily] = useState('ubuntu-2204-lts');
  const [gcpName, setGcpName] = useState('gcp-node');

  // AWS state
  const [awsRegion, setAwsRegion] = useState('us-west-2');
  const [awsVcpus, setAwsVcpus] = useState(2);
  const [awsMemory, setAwsMemory] = useState(4);
  const [awsTypes, setAwsTypes] = useState<AwsInstanceType[]>([]);
  const [awsSelectedType, setAwsSelectedType] = useState('');
  const [awsImageId, setAwsImageId] = useState('ami-03c1f788292172a4e'); // Ubuntu 22.04 in us-west-2
  const [awsName, setAwsName] = useState('aws-node');

  useEffect(() => {
    async function loadTypes() {
      try {
        if (provider === 'gcp') {
          const types = await getGcpInstanceTypes(gcpZone, gcpCpus, gcpRam);
          setGcpTypes(types);
          if (types.length > 0 && !gcpSelectedType) setGcpSelectedType(types[0].name);
        } else {
          const types = await getAwsInstanceTypes(awsRegion, awsVcpus, awsMemory);
          setAwsTypes(types);
          if (types.length > 0 && !awsSelectedType) setAwsSelectedType(types[0].instance_type);
        }
      } catch (err) {
        console.error("Failed to load instance types", err);
      }
    }
    loadTypes();
  }, [provider, gcpZone, gcpCpus, gcpRam, awsRegion, awsVcpus, awsMemory]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res;
      if (provider === 'gcp') {
        res = await createGcpInstance({
          zone: gcpZone,
          name: gcpName,
          machine_type: gcpSelectedType,
          count: count,
          image_project: gcpImageProject,
          image_family: gcpImageFamily,
          password: password || undefined
        });
      } else {
        res = await createAwsInstance({
          region: awsRegion,
          name: awsName,
          instance_type: awsSelectedType,
          min_count: count,
          max_count: count,
          image_id: awsImageId,
          password: password || undefined
        });
      }
      setResult(res);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Deploy New Instances</h2>

      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setProvider('gcp')}
          className={`px-4 py-2 rounded-md transition-colors ${provider === 'gcp' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          GCP
        </button>
        <button
          onClick={() => setProvider('aws')}
          className={`px-4 py-2 rounded-md transition-colors ${provider === 'aws' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          AWS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Fields */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instance Name Prefix</label>
            <input
              type="text"
              value={provider === 'gcp' ? gcpName : awsName}
              onChange={(e) => provider === 'gcp' ? setGcpName(e.target.value) : setAwsName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {provider === 'gcp' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
              <input
                type="text"
                value={gcpZone}
                onChange={(e) => setGcpZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min CPUs</label>
              <input
                type="number"
                value={gcpCpus}
                onChange={(e) => setGcpCpus(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min RAM (GB)</label>
              <input
                type="number"
                value={gcpRam}
                onChange={(e) => setGcpRam(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Machine Type</label>
              <select
                value={gcpSelectedType}
                onChange={(e) => setGcpSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {gcpTypes.map(t => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.cpus} vCPU, {t.ram_gb} GB RAM)
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                type="text"
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min vCPUs</label>
              <input
                type="number"
                value={awsVcpus}
                onChange={(e) => setAwsVcpus(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Memory (GB)</label>
              <input
                type="number"
                value={awsMemory}
                onChange={(e) => setAwsMemory(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instance Type</label>
              <select
                value={awsSelectedType}
                onChange={(e) => setAwsSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {awsTypes.map(t => (
                  <option key={t.instance_type} value={t.instance_type}>
                    {t.instance_type} ({t.vcpus} vCPU, {t.memory_gb} GB RAM)
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">AMI ID</label>
              <input
                type="text"
                value={awsImageId}
                onChange={(e) => setAwsImageId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-8">
        <button
          onClick={handleCreate}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md text-white font-bold text-lg transition-colors ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : provider === 'gcp'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
        >
          {loading ? 'Creating...' : `Create ${count} Instance${count > 1 ? 's' : ''}`}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md border border-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-md border border-green-200 overflow-auto">
          <h3 className="font-bold mb-2">Success!</h3>
          <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
