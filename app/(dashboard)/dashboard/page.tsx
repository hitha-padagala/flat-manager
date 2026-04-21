import { getDashboardStats } from '@/lib/actions';

interface UnpaidFlat {
  flatNumber: string;
  month: string;
  amount: number;
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Total Residents</h3>
          <p className="text-3xl font-bold mt-2 dark:text-white">{stats.totalResidents}</p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Paid Maintenance</h3>
          <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">{stats.paidCount}</p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Unpaid Maintenance</h3>
          <p className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">{stats.unpaidCount}</p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Total Expenses</h3>
          <p className="text-3xl font-bold mt-2 dark:text-white">₹{stats.totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Unpaid Flats</h2>
        {stats.unpaidFlats.length === 0 ? (
          <p className="text-gray-500 dark:text-stone-400">All maintenance payments are up to date!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-stone-700">
                  <th className="text-left py-3 px-4 dark:text-stone-300">Flat Number</th>
                  <th className="text-left py-3 px-4 dark:text-stone-300">Month</th>
                  <th className="text-right py-3 px-4 dark:text-stone-300">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(stats.unpaidFlats as UnpaidFlat[]).map((flat, index) => (
                  <tr key={index} className="border-b dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700">
                    <td className="py-3 px-4 dark:text-stone-200">{flat.flatNumber}</td>
                    <td className="py-3 px-4 dark:text-stone-200">{flat.month}</td>
                    <td className="py-3 px-4 text-right dark:text-stone-200">₹{flat.amount.toLocaleString()}</td>
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
