"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../@/components/ui/dialog";
  import {Button} from "../../../@/components/ui/button"
  import {Input} from "../../../@/components/ui/input"
  import {Label} from "../../../@/components/ui/label"
  
import  Cookies from "js-cookie"
import { useState } from "react";
function ProfileModal({ isEditing, setIsEditing, userData, setUserData }) {
  // const [isEditing, setIsEditing] = useState(false); // Toggles edit mode
  const [updatedData, setUpdatedData] = useState({}); // Stores updated form data

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const token = Cookies.get("authToken")
  // Update profile API call
    const updateProfile = async () => {
      try {
        const response = await fetch("/api/user/updateProfile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData), // Send updated data
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to update profile");
        }
        alert("Profile updated successfully!");
        setUserData({ ...userData, ...updatedData }); // Update state with new data
        setIsEditing(false); // Close edit modal
      } catch (err) {
        alert(`Error updating profile: ${err.message}`);
      }
    };

  return (
   
    <div >
           <Dialog open={isEditing} onOpenChange={setIsEditing}>
     
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
        {["name", "email", "cnic", "home", "phone", "voucherCategory"].map((field) => (
          <div key={field}>
            <Label className="block font-medium text-gray-700 capitalize">
              {field}:
            </Label>
            <Input
              id="email"
              name="email"
              value={updatedData.email || ""}
              onChange={handleInputChange}
            
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        ))}
      </div>
        <DialogFooter>
          <Button type="button" onClick={updateProfile}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </div>
    
  );
}


export default ProfileModal;
{/* <Dialog.Portal>
  <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
  <Dialog.Content className="fixed inset-0 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-96">
      <Dialog.Title className="text-xl font-bold mb-4">Edit Profile</Dialog.Title>
      <Dialog.Description className="mb-4 text-gray-600">
        Update your profile details below.
      </Dialog.Description>
      <div className="space-y-4">
        {["name", "email", "cnic", "home", "phone", "voucherCategory"].map((field) => (
          <div key={field}>
            <label className="block font-medium text-gray-700 capitalize">
              {field}:
            </label>
            <input
              type="text"
              name={field}
              defaultValue={userData[field]}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Dialog.Close asChild>
          <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </Dialog.Close>
        <button
          onClick={updateProfile}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Portal> */}

// const ProfileModal = ({ userData, setUserData }) => {
//   if (!userData) {
//     return <div>No user data provided</div>;
//   }
//   return (
//     <div>
//       <h2>Edit Profile for {userData.name}</h2>
//       {/* Update profile logic */}
//     </div>
//   );
// };

// export default ProfileModal;