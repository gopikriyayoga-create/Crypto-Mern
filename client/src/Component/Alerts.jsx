import React, { useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';

function Alerts() {
  const [alerts, setAlerts] = useState([
    { id: 1, coin: 'Bitcoin', symbol: 'BTC', condition: 'Above', price: '$70,000', active: true },
    { id: 2, coin: 'Ethereum', symbol: 'ETH', condition: 'Below', price: '$3,000', active: true },
  ]);

  return (
    <div className="p-6 h-full w-full flex flex-col  text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-orange-600">Price Alerts</h1>
          <p className="text-gray-500 mt-1">Manage your custom price notifications.</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
          
          <span>New Alerts</span>
        </button>
      </div>

      <div className="flex-1 bg-[#161616] border border-white/5 rounded-2xl p-6">
        {alerts.length === 0 ? (
          <div className="flex flex-col flex-1 items-center justify-center p-12 text-center h-full">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-orange-500">
              <Bell size={32} />
            </div>
            <h3 className="text-xl font-medium mb-2">No alerts set</h3>
            <p className="text-gray-500 max-w-sm">
              Create custom price alerts to get notified when your favorite coins hit your target price.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-sm">
                  <th className="pb-4 font-medium pl-4">Asset</th>
                  <th className="pb-4 font-medium">Condition</th>
                  <th className="pb-4 font-medium">Target Price</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-orange-400">
                          {alert.symbol[0]}
                        </div>
                        <div>
                          <div className="font-medium">{alert.coin}</div>
                          <div className="text-xs text-gray-500">{alert.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">
                      <span className={`px-2 py-1 rounded bg-white/5 text-xs ${alert.condition === 'Above' ? 'text-green-400' : 'text-red-400'}`}>
                        {alert.condition}
                      </span>
                    </td>
                    <td className="py-4 font-medium">{alert.price}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${alert.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></div>
                        <span className="text-sm text-gray-400">{alert.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <button 
                        onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                        className="text-gray-500 hover:text-red-400 transition-colors p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;
