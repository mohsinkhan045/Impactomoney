import React from "react";

const InstructionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 text-3xl "
        >
          &times;
        </button>
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <h2 className="text-xl font-bold">
            📌 <em>User List Upload Instructions for Admin</em>
          </h2>
          <p>
            Welcome, Admin! Before uploading the user list, please carefully
            review and follow these instructions to ensure that the data is
            correctly formatted and complete.
          </p>

          <h3 className="text-red-500 font-semibold">
            🚨 ⚠️ To ensure Excel treats wallet addresses as text, prepend a
            single quote (') before the address (e.g., '0x1234567890abcdef).
            This prevents Excel from formatting it incorrectly.
          </h3>

          <ul className="list-disc ml-6">
            <li>
              <strong>
                If you fail to provide the required details correctly, the user
                will NOT be eligible to receive a voucher or funding.
              </strong>
            </li>
            <li>
              <strong>
                Ensure all fields are accurately filled out; otherwise,
                applications may be rejected.
              </strong>
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4">
            🔹 Required Fields (Mandatory for Every User)
          </h3>
          <p>
            The following fields <strong>must be provided</strong> for each user
            in the list:
          </p>

          <table className="w-full border-collapse border border-gray-300 text-sm mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1">Field Name</th>
                <th className="border border-gray-300 px-2 py-1">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-2 py-1">name</td>
                <td className="border border-gray-300 px-2 py-1">
                  Full name of the beneficiary.
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1">email</td>
                <td className="border border-gray-300 px-2 py-1">
                  Valid email address of the user.
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1">picture</td>
                <td className="border border-gray-300 px-2 py-1">
                  Cloud link to the user’s profile picture.
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1">role</td>
                <td className="border border-gray-300 px-2 py-1">
                  Must always be <strong>"Beneficiary"</strong>.
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1">
                  National ID
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  User’s government-issued identification number.
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1">
                  voucherCategory
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  Must be one of: <em>Education, Health, Children, Religion</em>
                  .
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1">
                  wallet_address
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  User’s valid blockchain wallet address.
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-4">
            🔹 Additional Information (Required Based on Voucher Category)
          </h3>
          <p>
            The <strong>additionalInfo</strong> field varies depending on the{" "}
            <strong>voucherCategory</strong>. Ensure that the required details
            are provided:
          </p>

          <h4 className="font-semibold mt-2">🎓 Education Category</h4>
          <ul className="list-disc ml-6">
            <li>
              ✅ <strong>university</strong> → Name of the university.
            </li>
            <li>
              ✅ <strong>cgpa</strong> → Student’s cumulative GPA.
            </li>
            <li>
              ✅ <strong>purpose</strong> → Must be one of:{" "}
              <em>High Achieving, Poor, Both</em>.
            </li>
          </ul>

          <h4 className="font-semibold mt-2">🏥 Health Category</h4>
          <ul className="list-disc ml-6">
            <li>
              ✅ <strong>disease</strong> → Specify medical condition (e.g.,
              Cancer, Diabetes).
            </li>
            <li>
              ✅ <strong>hospital</strong> → Name of the hospital providing
              treatment.
            </li>
          </ul>

          <h4 className="font-semibold mt-2">👶 Children Category</h4>
          <ul className="list-disc ml-6">
            <li>
              ✅ <strong>age</strong> → Child’s age in years.
            </li>
            <li>
              ✅ <strong>guardian</strong> → Name of the child’s legal guardian.
            </li>
          </ul>

          <h4 className="font-semibold mt-2">🕌 Religion Category</h4>
          <ul className="list-disc ml-6">
            <li>
              ✅ <strong>religion</strong> → Specify the user’s religious
              affiliation.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4">⚠️ Important Notes</h3>
          <ul className="list-disc ml-6">
            <li>
              🚨 Incorrect details will result in disqualification from
              receiving vouchers.
            </li>
            <li>
              ✅ Ensure <strong>all required fields</strong> are included.
            </li>
            <li>
              ✅ Provide <strong>valid and correctly formatted data</strong>.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4">📤 Uploading the File</h3>
          <ol className="list-decimal ml-6">
            <li>
              Prepare the file in <strong>CSV or JSON</strong> format.
            </li>
            <li>Ensure all fields are filled correctly before submission.</li>
            <li>
              Upload via the <strong>Admin Dashboard</strong>.
            </li>
            <li>The system will validate the data and highlight any errors.</li>
          </ol>

          <p className="mt-4">
            📌{" "}
            <strong>
              Following these guidelines will ensure a smooth and error-free
              upload process.
            </strong>{" "}
            🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
