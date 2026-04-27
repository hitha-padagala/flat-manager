'use client';

export default function RulesPage() {
  const apartmentRules = [
    {
      category: "Lift & Elevator",
      rules: [
        "Always close the lift properly after use - do not hold the door open unnecessarily",
        "Do not force the lift doors to remain open",
        "Report any malfunction immediately to the building management"
      ]
    },
    {
      category: "Parking",
      rules: [
        "Park only in designated parking slots",
        "Do not park on yellow lines or in no-parking zones",
        "Ensure vehicles are properly aligned within parking boundaries",
        "Visitors must use designated visitor parking only"
      ]
    },
    {
      category: "Maintenance Payments",
      rules: [
        "Maintenance fees must be paid by the 5th of every month",
        "Late payments will incur a penalty as per society bylaws",
        "Keep payment receipts for future reference"
      ]
    },
    {
      category: "Common Areas",
      rules: [
        "Keep common areas (staircases, corridors, lobby) clean and clutter-free",
        "No smoking in common areas",
        "Children must be supervised in common areas",
        "Pets must be leashed in common areas; clean up after them"
      ]
    },
    {
      category: "Noise & Disturbance",
      rules: [
        " maintain silence during night hours (10 PM - 6 AM)",
        "Avoid loud music, TV, or gatherings that disturb neighbors",
        "Renovation work allowed only during specified hours"
      ]
    },
    {
      category: "Water & Electricity",
      rules: [
        "Use water and electricity responsibly - turn off taps and lights when not in use",
        "Report any leaks or electrical issues immediately",
        "Do not tamper with meters or utility connections"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Apartment Rules</h1>
      </div>

      <div className="bg-blue-50 dark:bg-stone-800 p-4 rounded-lg border-l-4 border-blue-500">
        <p className="text-sm text-gray-700 dark:text-stone-300">
          Please follow these rules to ensure a harmonious living environment. Violations may result in fines as per society bylaws.
        </p>
      </div>

      <div className="grid gap-6">
        {apartmentRules.map((section) => (
          <div key={section.category} className="bg-white dark:bg-stone-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-600 dark:text-orange-400">
              {section.category}
            </h2>
            <ul className="space-y-3">
              {section.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-stone-300">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500 mt-6">
        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Important Note</h3>
        <p className="text-sm text-red-700 dark:text-red-300">
          Non-compliance with these rules may result in penalties. Repeated violations can lead to additional actions as per the society&apos;s regulations.
        </p>
      </div>
    </div>
  );
}
